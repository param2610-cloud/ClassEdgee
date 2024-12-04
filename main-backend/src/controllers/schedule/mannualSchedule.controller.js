
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Initialize schedule
const initSchedule= async (req, res) => {
  const { departmentId, batchYear, academicYear, semester, totalWeeks,userId,sectionId } = req.body;
  
  try {
    const schedule = await prisma.schedule_meta.create({
      data: {
        department_id: parseInt(departmentId),
        academic_year: parseInt(academicYear),
        semester:parseInt(semester),
        batch_year: parseInt(batchYear),
        status: 'mannual',
        created_by: parseInt(userId), // Replace with actual user ID from auth,
        section_id:parseInt(sectionId)
      }
    });
    
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to initialize schedule' });
  }
};

// Get time slots
const getTimeSlots = async (req, res) => {
  const { departmentId, semester } = req.query;
  
  try {
    const slots = await prisma.timeslots.findMany({
      where: {
        semester: Number(semester),
        day_of_week: {
          lte: 5 // Only weekdays
        }
      },
      orderBy: [
        { day_of_week: 'asc' },
        { start_time: 'asc' }
      ]
    });
    
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch time slots' });
  }
};



// Get subjects
const subjectTime = async (req, res) => {
  const { departmentId, semester } = req.query;
  
  try {
    const subjects = await prisma.subject_details.findMany({
      where: {
        courses: {
          department_id: Number(departmentId)
        },
        syllabus_structure: {
          semester: Number(semester)
        }
      },
      include: {
        units: true, // Include units to calculate total hours
      }
    });

    // Calculate weekly classes for each subject
    const subjectsWithHours = subjects.map(subject => {
      const totalHours = subject.units.reduce((sum, unit) => 
        sum + unit.required_hours, 0
      );
      
      return {
        id: subject.subject_id,
        name: subject.subject_name,
        code: subject.subject_code,
        totalHours,
        weeklyClasses: Math.ceil(totalHours / Number(req.query.totalWeeks))
      };
    });
    
    res.json(subjectsWithHours);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};

// Get available faculty
const get_available_faculty =  async (req, res) => {
  const { subjectId, slotId } = req.query;
  
  try {
    // Get faculty mapped to this subject
    const mappedFaculty = await prisma.faculty_subject_mapping.findMany({
      where: {
        subject_id: Number(subjectId),
        status: 'active'
      },
      include: {
        faculty: {
          include: {
            users: {
              select: {
                first_name: true,
                last_name: true
              }
            }
          }
        }
      }
    });

    // Check availability for the given slot
    const timeSlot = await prisma.timeslots.findUnique({
      where: { slot_id: Number(slotId) }
    });

    const facultyWithAvailability = await Promise.all(
      mappedFaculty.map(async (mapping) => {
        // Check if faculty is already scheduled in this slot
        const existing = await prisma.schedule_details.findFirst({
          where: {
            faculty_id: mapping.faculty_id,
            timeslot_id: Number(slotId)
          }
        });

        return {
          id: mapping.faculty_id,
          name: `${mapping.faculty.users.first_name} ${mapping.faculty.users.last_name}`,
          isAvailable: !existing && 
            mapping.faculty.preferred_slots.includes(Number(slotId))
        };
      })
    );
    
    res.json(facultyWithAvailability);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch faculty' });
  }
};

// Get available rooms
const get_available_rooms =  async (req, res) => {
  const { slotId, buildingId } = req.query;
  
  try {
    const rooms = await prisma.rooms.findMany({
      where: {
        building_id: buildingId ? Number(buildingId) : undefined,
        status: 'available'
      },
      include: {
        buildings: true
      }
    });

    // Check room availability for the slot
    const roomsWithAvailability = await Promise.all(
      rooms.map(async (room) => {
        const existing = await prisma.schedule_details.findFirst({
          where: {
            room_id: room.room_id,
            timeslot_id: Number(slotId)
          }
        });

        return {
          id: room.room_id,
          roomNumber: room.room_number,
          type: room.room_type,
          capacity: room.capacity,
          buildingId: room.building_id,
          buildingName: room.buildings?.building_name,
          isAvailable: !existing
        };
      })
    );
    
    res.json(roomsWithAvailability);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};

// Assign schedule
const assignSchedule = async (req, res) => {
  const { scheduleId, slotId, facultyId, roomId, subjectId, sectionId } = req.body;
  
  try {
    // Create schedule detail
    const scheduleDetail = await prisma.schedule_details.create({
      data: {
        schedule_id: scheduleId,
        faculty_id: facultyId,
        room_id: roomId,
        timeslot_id: slotId
      }
    });

    // Create class entry
    const classEntry = await prisma.classes.create({
      data: {
        detail_id: scheduleDetail.detail_id,
        faculty_id: facultyId,
        room_id: roomId,
        slot_id: slotId,
        section_id: sectionId,
        semester: Number(req.body.semester),
        academic_year: Number(req.body.academicYear),
        is_active: true
      }
    });
    
    res.json({ scheduleDetail, classEntry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign schedule' });
  }
};

// Export schedule
const export_schedule =  async (req, res) => {
  const { scheduleId } = req.params;
  
  try {
    const scheduleDetails = await prisma.schedule_details.findMany({
      where: {
        schedule_id: Number(scheduleId)
      },
      include: {
        faculty_schedule_details_faculty_idTofaculty: {
          include: {
            users: true
          }
        },
        rooms_schedule_details_room_idTorooms: true,
        timeslots: true,
        classes: {
          include: {
            sections: true,
            courses: true
          }
        }
      }
    });

    const formattedSchedule = scheduleDetails.map(detail => ({
      day: detail.day_of_week,
      startTime: detail.timeslots.start_time,
      endTime: detail.timeslots.end_time,
      subject: detail.classes[0]?.courses?.course_name,
      faculty: `${detail.faculty_schedule_details_faculty_idTofaculty.users.first_name} ${detail.faculty_schedule_details_faculty_idTofaculty.users.last_name}`,
      room: detail.rooms_schedule_details_room_idTorooms.room_number,
      section: detail.classes[0]?.sections?.section_name
    }));
    
    res.json(formattedSchedule);
  } catch (error) {
    res.status(500).json({ error: 'Failed to export schedule' });
  }
};


export { initSchedule, getTimeSlots, subjectTime, get_available_faculty, get_available_rooms, assignSchedule, export_schedule };