import {PrismaClient} from '@prisma/client'
import e from "express";
const prisma = new PrismaClient()
const router = e.Router()
router.get('/emergency-alerts', async (req, res) => {
    try {
        const alerts = await prisma.emergencyalerts.findMany({
            where: {
                type: 'fire',
                status: 'active'
            },
            include: {
                rooms: {
                    include: {
                        buildings: true
                    }
                }
            }
        });
        
        return res.status(200).json(alerts);
    } catch (error) {
        console.error('Error fetching alerts:', error);
        return res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

// Create new emergency alert
router.post('/emergency-alerts', async (req, res) => {
    try {
        const { type, location_id, description, severity } = req.body;

        // Input validation
        if (!location_id || !description || !severity) {
            return res.status(400).json({ 
                error: 'Missing required fields' 
            });
        }

        // Create the alert
        const alert = await prisma.emergencyalerts.create({
            data: {
                type: type || 'fire',
                severity: severity.toLowerCase(),
                location_id: parseInt(location_id),
                description,
                status: 'active',
                reported_at: new Date()
            }
        });

        // Create notifications for all users
        const users = await prisma.users.findMany();
        
        await prisma.alertnotifications.createMany({
            data: users.map(user => ({
                alert_id: alert.alert_id,
                recipient_id: user.user_id,
                message: `EMERGENCY: ${type.toUpperCase()} alert - ${description}`,
                delivery_status: 'pending'
            }))
        });

        return res.status(201).json(alert);
    } catch (error) {
        console.error('Error creating alert:', error);
        return res.status(500).json({ 
            error: 'Failed to create alert',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});

// Get building rooms
router.get('/buildings/:buildingId/rooms', async (req, res) => {
    try {
        const { buildingId } = req.params;
        
        const rooms = await prisma.rooms.findMany({
            where: {
                building_id: parseInt(buildingId)
            },
            select: {
                room_id: true,
                room_number: true,
                floor_number: true,
                room_type: true,
                status: true
            }
        });
        
        return res.status(200).json(rooms);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return res.status(500).json({ error: 'Failed to fetch rooms' });
    }
});

// Get buildings with status
router.get('/buildings', async (req, res) => {
    try {
        const buildings = await prisma.buildings.findMany({
            include: {
                rooms: {
                    include: {
                        emergencyalerts: {
                            where: {
                                status: 'active'
                            }
                        }
                    }
                }
            }
        });

        const buildingStatus = buildings.map(building => ({
            id: building.building_id,
            name: building.building_name,
            status: building.rooms.some(room => 
                room.emergencyalerts.length > 0
            ) ? 'alert' : 'clear'
        }));

        return res.status(200).json(buildingStatus);
    } catch (error) {
        console.error('Error fetching buildings:', error);
        return res.status(500).json({ error: 'Failed to fetch buildings' });
    }
});

// Update alert status
router.patch('/emergency-alerts/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const alert = await prisma.emergencyalerts.update({
            where: { 
                alert_id: parseInt(id) 
            },
            data: {
                status,
                resolved_at: status === 'resolved' ? new Date() : null
            }
        });

        return res.status(200).json(alert);
    } catch (error) {
        console.error('Error updating alert:', error);
        return res.status(500).json({ error: 'Failed to update alert' });
    }
});
  
  // Get evacuation routes for a building
  router.get('/evacuation-routes/:buildingId', async (req, res) => {
    const { buildingId } = req.params;
  
    try {
      const building = await prisma.buildings.findUnique({
        where: { building_id: parseInt(buildingId) }
      });
  
      // This would typically come from a database, but for demo purposes:
      const routes = {
        primary: {
          steps: ["Main Entrance", "Central Corridor", "Emergency Exit A"]
        },
        secondary: {
          steps: ["Side Entrance", "West Corridor", "Emergency Exit B"]
        }
      };
  
      res.json({
        building: building?.building_name,
        routes
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch evacuation routes' });
    }
  });
  router.get('/emergency-contacts', async (req, res) => {
    // This would typically come from a database, but for demo purposes:
    const contacts = [
      { title: "Emergency Services", number: "911" },
      { title: "Campus Security", number: "555-0123" },
      { title: "Fire Department", number: "101" },
      { title: "Building Manager", number: "555-0125" }
    ];
    
    res.json(contacts);
  });

  export default router 