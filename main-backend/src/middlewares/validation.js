import prisma from "../db/connect.js"; 

export const validateScheduleRequest = async (req, res, next) => {
  try {
    const { departmentId, academicYear, semester, batchYear } = req.body;
    console.log(departmentId, academicYear, semester, batchYear);
    
    if (!departmentId || !academicYear || !semester || !batchYear) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const department = await prisma.departments.findUnique({
      where: { department_id: departmentId }
    });

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const currentYear = new Date().getFullYear();
    if (academicYear < currentYear || academicYear > currentYear + 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid academic year'
      });
    }

    if (semester < 1 || semester > 8) {
      return res.status(400).json({
        success: false,
        message: 'Invalid semester'
      });
    }

    const existingSchedule = await prisma.schedule_meta.findFirst({
      where: {
        department_id: departmentId,
        academic_year: academicYear,
        semester: semester,
        batch_year: batchYear,
        status: 'published'
      }
    });

    if (existingSchedule) {
      return res.status(400).json({
        success: false,
        message: 'Schedule already exists for given parameters'
      });
    }

    next();
  } catch (error) {
    console.error('Validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during validation'
    });
  }
};