import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

//Helper function to validate time format
const isValidTimeFormat = (time) => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
    return timeRegex.test(time);
};
//another helper

const formatToLocalTime = (dateTime) => {
    const localDate = new Date(dateTime); // Assumes dateTime is in UTC
    return localDate.toISOString().split('T')[1].split('.')[0]; // Format to HH:mm:ss
};
//another helper1 
const timeStringToDateTime = (timeStr) => {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setUTCHours(hours, minutes, seconds, 0); // Set time in UTC
    return date;
};

//Helper function to convert time string to DateTime
// const timeStringToDateTime = (timeStr) => {
    // const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    // const date = new Date();
    // date.setHours(hours, minutes, seconds, 0);
    // return date;
// };

//Create a new timeslot
const createTimeSlot = async (req, res) => {
    try {
        console.log('Received body:', req.body);
        const { start_time, end_time, day_of_week, slot_type } = req.body;
      

      // Validate required fields
        if (!start_time || !end_time || day_of_week === undefined ) {
            return res.status(400).json({
                success: false,
                message: "Missing required fields: start_time, end_time, and day_of_week are required"
            });
        }

     //  Validate time format
        if (!isValidTimeFormat(start_time) || !isValidTimeFormat(end_time)) {
            return res.status(400).json({
                success: false,
                message: "Invalid time format. Use HH:MM:SS"
            });
        }

     //  Validate day_of_week (0-6, where 0 is Sunday)
        const dayNum = Number(day_of_week);
        if (!Number.isInteger(dayNum) || dayNum < 1 || dayNum > 6) {
            return res.status(400).json({
                success: false,
                message: "day_of_week must be an integer between 0 and 6"
            });
        }

     //  Convert time strings to DateTime objects
        const startDateTime = timeStringToDateTime(start_time);
        const endDateTime = timeStringToDateTime(end_time);

      // Check if end time is after start time
        if (endDateTime <= startDateTime) {
            return res.status(400).json({
                success: false,
                message: "End time must be after start time"
            });
        }

     //   Try to create the time slot (unique constraint will be handled by Prisma)
        const newTimeSlot = await prisma.timeslots.create({
            data: {
                start_time: startDateTime,
                end_time: endDateTime,
                day_of_week: dayNum,
                slot_type: slot_type || "regular"
            }
        }).catch(error => {
           // Handle unique constraint violation
            if (error.code === 'P2002') {
                throw new Error('A time slot with these exact times and day already exists');
            }
            throw error;
        });

        return res.status(201).json({
            success: true,
            data: newTimeSlot
        });

    } catch (error) {
        console.error('Error creating time slot:', error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error while creating time slot",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

//Delete a timeslot
const deleteTimeSlot = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: "Invalid slot ID provided"
            });
        }

      //  Check if the timeslot has any associated classes
        const timeSlot = await prisma.timeslots.findUnique({
            where: { slot_id: parseInt(id) },
            include: { classes: true }
        });

        if (!timeSlot) {
            return res.status(404).json({
                success: false,
                message: "Time slot not found"
            });
        }

        //Check if there are any associated classes
        if (timeSlot.classes.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete time slot with associated classes"
            });
        }

        await prisma.timeslots.delete({
            where: { slot_id: parseInt(id) }
        });

        return res.status(200).json({
            success: true,
            message: "Time slot deleted successfully"
        });

    } catch (error) {
        console.error('Error deleting time slot:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while deleting time slot",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

//Get all timeslots
const getTimeSlots = async (req, res) => {
    try {
        const timeSlots = await prisma.timeslots.findMany({
            orderBy: [
                { day_of_week: 'asc' },
                { start_time: 'asc' }
            ],
            include: {
                classes: {
                    select: {
                        class_id: true,
                        
                    }
                }
            }
        });

      // Format the DateTime objects for response
        const formattedTimeSlots = timeSlots.map(slot => ({
            ...slot,
            start_time: slot.start_time.toISOString().split('T')[1].split('.')[0],
            end_time: slot.end_time.toISOString().split('T')[1].split('.')[0]
          //  start_time: formatToLocalTime(slot.start_time),
         //   end_time: formatToLocalTime(slot.end_time)
          
          
        }));

        return res.status(200).json({
            success: true,
            data: formattedTimeSlots
        });

    } catch (error) {
        console.error('Error fetching time slots:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching time slots",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

//Get timeslots for a specific day
const getTimeSlotsByDay = async (req, res) => {
    try {
        const { dayOfWeek } = req.params;
        
        if (!dayOfWeek || isNaN(parseInt(dayOfWeek)) || parseInt(dayOfWeek) < 0 || parseInt(dayOfWeek) > 6) {
            return res.status(400).json({
                success: false,
                message: "Invalid day of week. Must be a number between 0 and 6"
            });
        }

        const timeSlots = await prisma.timeslots.findMany({
            where: { day_of_week: parseInt(dayOfWeek) },
            orderBy: { start_time: 'asc' },
            include: {
                classes: {
                    select: {
                        class_id: true,
                        
                    }
                }
            }
        });

     //  Format the DateTime objects for response
        const formattedTimeSlots = timeSlots.map(slot => ({
            ...slot,
           // start_time: slot.start_time.toISOString().split('T')[1].split('.')[0],
           // end_time: slot.end_time.toISOString().split('T')[1].split('.')[0]
             
           start_time: formatToLocalTime(slot.start_time),
           end_time: formatToLocalTime(slot.end_time)


        }));

        return res.status(200).json({
            success: true,
            data: formattedTimeSlots
        });

    } catch (error) {
        console.error('Error fetching time slots for day:', error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching time slots for day",
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

export {
    createTimeSlot,
    deleteTimeSlot,
    getTimeSlots,
    getTimeSlotsByDay
};









































































































































































