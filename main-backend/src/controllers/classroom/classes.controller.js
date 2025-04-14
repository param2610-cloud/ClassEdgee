import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const getUpcomingClassesOfFaculty = async (req, res) => {
  try {
    const { facultyId, number_of_class } = req.params;
    const currentDate = new Date();
    
    // Get all active classes for the faculty on Jan 17th 2025
    const upcomingClasses = await prisma.classes.findMany({
      where: {
        faculty_id: parseInt(facultyId),
        is_active: true,
        date_of_class: new Date('2025-01-17')
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

    // Filter upcoming classes based on current time
    const processedClasses = upcomingClasses.filter(classItem => {
      if (!classItem.date_of_class || !classItem.timeslots) {
        return false;
      }

      const classDate = new Date(classItem.date_of_class);
      const slotStartTime = new Date(classItem.timeslots.start_time);
      const classDateTime = new Date(classDate);
      classDateTime.setHours(slotStartTime.getHours(), slotStartTime.getMinutes(), 0, 0);
      
      return classDateTime > currentDate;
    });

    res.json(processedClasses[number_of_class] || {});
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

        // If class is in the past and in December 2024, update to January 2025
        if (classDateTime < currentDate) {
          let newYear = classDate.getFullYear();
          let newMonth = classDate.getMonth() + 1;

          if (newMonth > 12) {
            newMonth = 1;
            newYear += 1;
          }
          if (newYear === 2024) {
            newYear = 2025;
          }

          const newDate = new Date(classDate);
          newDate.setFullYear(newYear);
          newDate.setMonth(newMonth - 1); // setMonth is 0-based

          await prisma.classes.update({
            where: { class_id: classItem.class_id },
            data: { date_of_class: newDate },
          });
          classItem.date_of_class = newDate;
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
                quizzes:{
                  include:{
                     quiz_questions:true,
                     quiz_responses:true
                  }
                },
                timeslots:true
            }
        });
        res.json(classData);
    } catch (error) {
      console.log(error);
      
        res.status(500).json({error:error.message});
    }
}
const pastClasses_student = async (req, res) => {
  const { userId } = req.params;
  try {
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const studentData = await prisma.students.findUnique({
      where: {
        user_id: parseInt(userId),
      },
      select: {
        section_id: true,
      },
    });

    if (!studentData) {
      return res.status(404).json({ error: "Student not found" });
    }

    const data = await prisma.classes.findMany({
      where: {
        is_active: false,
        section_id: studentData.section_id
      },
      include: {
        courses: true,
        faculty: true,
        rooms: true,
        timeslots: true
      },
      orderBy: {
        date_of_class: 'desc'
      }
    });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}

const pastClasses_faculty = async (req, res) => {
  const { userId } = req.params;
  try {
    if (!userId) {
      return res.status(400).json({ error: "Faculty ID is required" });
    }
    console.log(userId);
    
    const facultyData = await prisma.faculty.findUnique({
      where: {
        user_id: parseInt(userId),
      },
      select: {
        faculty_id: true,
      },
    });
    const data = await prisma.classes.findMany({
      where: {
        // is_active: false,
        faculty_id: parseInt(facultyData.faculty_id)

      },
      include: {
        courses: true,
        sections: true,
        rooms: true,
        timeslots: true
      },
      orderBy: {
        date_of_class: 'desc'
      }
    });
    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
}

export { getUpcomingClassesOfFaculty, getUpcomingClassesOfStudent,getUniqueClass,pastClasses_student,pastClasses_faculty };