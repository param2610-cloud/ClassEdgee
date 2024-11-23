import { PrismaClient } from "@prisma/client";
//Get all course
const getAllCourse = async (req, res) => {
  try {
    const courses = await PrismaClient.courses.findMany({
      include: {
        departments: {
          select: { department_name: true }
        }
      }
    });
    res.json(courses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//Adding course
const addCourse =  async (req, res) => {
  const { 
    course_code, 
    course_name, 
    department_id, 
    credits, 
    description, 
    prerequisites,
    syllabus_url,
    learning_outcomes
  } = req.body;

  try {
    const course = await PrismaClient.courses.create({
      data: {
        course_code,
        course_name,
        department_id,
        credits,
        description,
        prerequisites,
        syllabus_url,
        learning_outcomes
      }
    });
    res.json(course);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

  export {getAllCourse,addCourse};
