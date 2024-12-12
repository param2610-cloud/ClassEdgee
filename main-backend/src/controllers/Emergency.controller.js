import { PrismaClient} from '@prisma/client'

const prisma = new PrismaClient()

const createEmergency = async (req, res) => {
     try {
        const { type, severity, location_id, description, reported_by, resolved_at, resolution_notes, status } = req.body;

        const newEmergency = await prisma.emergencyalerts.create({
            data: {
                type,
                severity,
                location_id,
                description,
                reported_by,
                resolved_at,
                resolution_notes,
                status
            }
        });

        res.status(201).json(newEmergency);
     } catch (error) {
         console.error(error)
        res.status(500).json({message: 'Internal server error'})
     }
}

const getEmergencies = async (req, res) => {
    try {
        const emergencies = await prisma.emergencyalerts.findMany({
            where: {
                status: 'active'
            }
        });
        res.json(emergencies);
    } catch (error) {
        console.error(error)
        res.status(500).json({message: 'Internal server error'})
    }
}
const listOfAlerts = async (req, res) => {
    try {
        const alertList = await prisma.emergencyalerts.findMany()
    } catch (error) {
        console.error(error)
        res.status(500).json({message: 'Internal server error'})
        
    }
}
const updateAlertStatus = async (req, res) => {
    try {
        const {alertId} = req.params;

        const updatedAlert = await prisma.emergencyalerts.update({
            where: {
                id: parseInt(alertId)
            },
            data: {
                status: 'resolved'
            }
        });
        res.json(updatedAlert);
    } catch (error) {
        console.error(error)
        res.status(500).json({message: 'Internal server error'})
    }
}

export { createEmergency, getEmergencies,updateAlertStatus,listOfAlerts }