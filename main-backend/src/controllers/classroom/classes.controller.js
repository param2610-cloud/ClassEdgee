import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getUpcomingClassesOfFaculty = async (req, res) => {
  try {
    const { facultyId,number_of_class } = req.params;
    const currentDate = new Date();
    
    // Get all active classes for the faculty
    const upcomingClasses = await prisma.classes.findMany({
      where: {
        faculty_id: parseInt(facultyId),
        is_active: true,
      },
      include: {
        courses: true,
        faculty: true,
        rooms: true,
        sections: true,
        timeslots: true,
      },
      orderBy: {
        date_of_class: "asc",
      },
    });

    // Filter and update classes
    const processedClasses = await Promise.all(
      upcomingClasses.map(async (classItem) => {
        if (!classItem.date_of_class || !classItem.timeslots) {
          return null;
        }

        // Create class datetime by combining date and time
        const classDate = new Date(classItem.date_of_class);
        const slotStartTime = new Date(classItem.timeslots.start_time);
        
        const classDateTime = new Date(classDate);
        classDateTime.setHours(
          slotStartTime.getHours(),
          slotStartTime.getMinutes(),
          0,
          0
        );

        // If class is in the past, update status and filter it out
        if (classDateTime < currentDate) {
          await prisma.classes.update({
            where: { class_id: classItem.class_id },
            data: { is_active: false },
          });
          return null;
        }

        return classItem;
      })
    );

    const activeClasses = processedClasses.filter(Boolean);
    res.json(activeClasses[number_of_class] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUpcomingClassesOfStudent = async (req, res) => {
  try {
    const { studentId,number_of_class } = req.params;
    const currentDate = new Date();

    // Get student's section
    const studentDetails = await prisma.students.findUnique({
      where: {
        student_id: parseInt(studentId),
      },
      include: {
        sections: {
          select: {
            section_id: true,
          },
        },
      },
    });

    if (!studentDetails?.sections?.section_id) {
      return res.status(400).json({ error: "Student is not assigned to any section" });
    }

    // Get all active classes for the student's section
    const upcomingClasses = await prisma.classes.findMany({
      where: {
        section_id: studentDetails.sections.section_id,
        is_active: true,
      },
      select: {
        date_of_class: true,
        class_id: true,
        courses: {
          select:{
            course_name:true,
            course_code:true,
          }
        },
        faculty: true,
        rooms: {
          select: {
            room_number: true,
          }
        },
        sections: {
          select: {
            section_name: true,
          },
        },
        timeslots: {
          select: {
            start_time: true,
            end_time: true,
          },
        },
      },
      orderBy: {
        date_of_class: "asc",
      },
    });

    // Filter and update classes
    const processedClasses = await Promise.all(
      upcomingClasses.map(async (classItem) => {
        if (!classItem.date_of_class || !classItem.timeslots) {
          return null;
        }

        // Create class datetime by combining date and time
        const classDate = new Date(classItem.date_of_class);
        const slotStartTime = new Date(classItem.timeslots.start_time);
        
        const classDateTime = new Date(classDate);
        classDateTime.setHours(
          slotStartTime.getHours(),
          slotStartTime.getMinutes(),
          0,
          0
        );

        // If class is in the past, update status and filter it out
        if (classDateTime < currentDate) {
          await prisma.classes.update({
            where: { class_id: classItem.class_id },
            data: { is_active: false },
          });
          return null;
        }

        return classItem;
      })
    );

    const activeClasses = processedClasses.filter(Boolean);
    res.json(activeClasses[number_of_class] || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const getUniqueClass = async(req,res)=>{
    try {
        const {class_id} = req.params;
        if(!class_id){
            return res.status(400).json({error:"Class id is required"});
        }
        const classData = await prisma.classes.findUnique({
            where:{
                class_id:parseInt(class_id)
            },
            include:{
                courses:true,
                faculty:{
                    include:{
                        users:true
                    }
                },
                rooms:true,
                sections:{
                    include:{
                        departments:true
                    }
                },
                timeslots:true,
                schedule_details:{
                    include:{
                        subject_details:{
                            select:{
                                subject_name:true,
                                subject_code:true,
                                syllabus_structure:{
                                    include:{
                                        subject_details:{
                                            select:{
                                                subject_name:true,
                                                subject_code:true,
                                                subject_id:true,
                                                units:{
                                                    select:{
                                                        unit_id:true,
                                                        unit_name:true,
                                                        topics:{
                                                            select:{
                                                                topic_id:true,
                                                                topic_name:true,
                                                                topic_description:true,
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });
        res.json(classData);
    } catch (error) {
        res.status(500).json({error:error.message});
    }
}

export { getUpcomingClassesOfFaculty, getUpcomingClassesOfStudent,getUniqueClass };