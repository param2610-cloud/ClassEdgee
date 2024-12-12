import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Emergency types and their default severity levels
const EMERGENCY_TYPES = {
    FIRE: 'HIGH',
    MEDICAL: 'HIGH',
    SECURITY: 'HIGH',
    MAINTENANCE: 'MEDIUM',
    ENVIRONMENTAL: 'MEDIUM',
    UTILITY: 'MEDIUM'
};

export const createEmergencyAlert = async (req, res) => {
    try {
        const { 
            room_number, 
            description, 
            emergency_type,
            severity_override 
        } = req.body;

        // Validate emergency type
        if (!EMERGENCY_TYPES[emergency_type]) {
            return res.status(400).json({
                success: false,
                error: `Invalid emergency type. Must be one of: ${Object.keys(EMERGENCY_TYPES).join(', ')}`
            });
        }

        // Find the room
        const room = await prisma.rooms.findUnique({
            where: { room_number }
        });

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        // Create the emergency alert
        const alert = await prisma.emergencyalerts.create({
            data: {
                type: emergency_type,
                severity: severity_override || EMERGENCY_TYPES[emergency_type],
                location_id: room.room_id,
                description,
                status: 'active'
            },
            include: {
                rooms: {
                    select: {
                        room_number: true,
                        floor_number: true,
                        wing: true,
                        building_id: true,
                        buildings: {
                            select: {
                                building_name: true
                            }
                        }
                    }
                }
            }
        });

        // Fetch all users for notification
        const allUsers = await prisma.users.findMany({
            select: { user_id: true }
        });

        // Construct location string
        const locationInfo = `${alert.rooms.buildings?.building_name || ''} ${
            alert.rooms.wing ? `Wing ${alert.rooms.wing}` : ''
        }, Floor ${alert.rooms.floor_number}, Room ${alert.rooms.room_number}`;

        // Create notifications for all users
        await prisma.alertnotifications.createMany({
            data: allUsers.map(user => ({
                alert_id: alert.alert_id,
                user_id: user.user_id,
                notification_type: 'EMERGENCY',
                message: `${emergency_type} ALERT: ${description} at ${locationInfo}`,
                status: 'UNREAD'
            }))
        });

        res.status(201).json({
            success: true,
            data: alert
        });
    } catch (error) {
        console.error('Error creating emergency alert:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create emergency alert'
        });
    }
};

export const getAlertsByType = async (req, res) => {
    try {
        const { emergency_type } = req.params;
        const { status } = req.query;

        // Validate emergency type if provided
        if (emergency_type && !EMERGENCY_TYPES[emergency_type]) {
            return res.status(400).json({
                success: false,
                error: `Invalid emergency type. Must be one of: ${Object.keys(EMERGENCY_TYPES).join(', ')}`
            });
        }

        const whereClause = {
            ...(emergency_type && { type: emergency_type }),
            ...(status && { status })
        };

        const alerts = await prisma.emergencyalerts.findMany({
            where: whereClause,
            include: {
                rooms: {
                    select: {
                        room_number: true,
                        floor_number: true,
                        wing: true,
                        buildings: {
                            select: {
                                building_name: true
                            }
                        }
                    }
                }
            },
            orderBy: { reported_at: 'desc' }
        });

        res.status(200).json({
            success: true,
            data: alerts
        });
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch alerts'
        });
    }
};

export const resolveEmergencyAlert = async (req, res) => {
    try {
        const { alert_id } = req.params;
        const { resolution_notes, resolution_type } = req.body;

        const updatedAlert = await prisma.emergencyalerts.update({
            where: { alert_id: parseInt(alert_id) },
            data: {
                status: 'resolved',
                resolved_at: new Date(),
                resolution_notes,
                resolution_type
            }
        });

        // Mark related notifications as read
        await prisma.alertnotifications.updateMany({
            where: { alert_id: parseInt(alert_id) },
            data: { status: 'READ' }
        });

        // Create resolution notification
        const alert = await prisma.emergencyalerts.findUnique({
            where: { alert_id: parseInt(alert_id) },
            include: {
                rooms: {
                    include: {
                        buildings: true
                    }
                }
            }
        });

        const allUsers = await prisma.users.findMany({
            select: { user_id: true }
        });

        const locationInfo = `${alert.rooms.buildings?.building_name || ''} ${
            alert.rooms.wing ? `Wing ${alert.rooms.wing}` : ''
        }, Floor ${alert.rooms.floor_number}, Room ${alert.rooms.room_number}`;

        // Create resolution notifications
        await prisma.alertnotifications.createMany({
            data: allUsers.map(user => ({
                alert_id: alert.alert_id,
                user_id: user.user_id,
                notification_type: 'RESOLUTION',
                message: `${alert.type} ALERT RESOLVED: ${locationInfo} - ${resolution_notes}`,
                status: 'UNREAD'
            }))
        });

        res.status(200).json({
            success: true,
            data: updatedAlert
        });
    } catch (error) {
        console.error('Error resolving alert:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to resolve alert'
        });
    }
};

export const getEmergencyStatistics = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;

        const whereClause = {
            ...(start_date && end_date && {
                reported_at: {
                    gte: new Date(start_date),
                    lte: new Date(end_date)
                }
            })
        };

        // Get counts by type and status
        const stats = await prisma.emergencyalerts.groupBy({
            by: ['type', 'status'],
            where: whereClause,
            _count: true
        });

        // Get average resolution time
        const resolvedAlerts = await prisma.emergencyalerts.findMany({
            where: {
                ...whereClause,
                status: 'resolved',
                resolved_at: { not: null }
            },
            select: {
                reported_at: true,
                resolved_at: true,
                type: true
            }
        });

        const avgResolutionTimes = {};
        resolvedAlerts.forEach(alert => {
            const resolutionTime = alert.resolved_at - alert.reported_at;
            if (!avgResolutionTimes[alert.type]) {
                avgResolutionTimes[alert.type] = [];
            }
            avgResolutionTimes[alert.type].push(resolutionTime);
        });

        // Calculate averages
        Object.keys(avgResolutionTimes).forEach(type => {
            const times = avgResolutionTimes[type];
            avgResolutionTimes[type] = times.reduce((a, b) => a + b, 0) / times.length;
        });

        res.status(200).json({
            success: true,
            data: {
                alert_counts: stats,
                average_resolution_times: avgResolutionTimes
            }
        });
    } catch (error) {
        console.error('Error fetching emergency statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch emergency statistics'
        });
    }
};