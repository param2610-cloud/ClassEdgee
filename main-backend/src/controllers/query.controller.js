import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const getQueryOfStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    if (!studentId || isNaN(studentId)) {
      return res.status(400).json({ error: 'Invalid student ID' });
    }

    const queries = await prisma.student_queries.findMany({
      where: {
        student_id: parseInt(studentId)
      },
      include: {
        faculty: {
          include: {
            users: {
              select: {
                first_name: true,
                last_name: true,
                college_uid: true
              }
            }
          }
        },
        query_messages: {
          orderBy: {
            created_at: 'asc'
          },
          include: {
            users: {
              select: {
                first_name: true,
                last_name: true,
                college_uid: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    res.status(200).json(queries);
  } catch (error) {
    console.error('Error in getQueryOfStudent:', error);
    res.status(500).json({ 
      error: 'Failed to fetch queries',
      details: error.message 
    });
  }
};

const getQueryOfFaculty =  async (req, res) => {
  try {
    const { facultyId } = req.params;
    if (!facultyId || isNaN(facultyId)) {
      return res.status(400).json({ error: 'Invalid faculty ID' });
    }
    const queries = await prisma.student_queries.findMany({
      where: {
        faculty_id: parseInt(req.params.facultyId)
      },
      include: {
        students: {
          include: {
            users: {
              select: {
                first_name: true,
                last_name: true
              }
            }
          }
        },
        query_messages: {
          orderBy: {
            created_at: 'asc'
          },
          include: {
            users: {
              select: {
                first_name: true,
                last_name: true
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
    res.json(queries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch queries' });
  }
}

const createQuery = async (req, res) => {
  const { title, description, studentId, facultyId } = req.body;
  try {
    const query = await prisma.student_queries.create({
      data: {
        title,
        description,
        student_id: parseInt(studentId),
        faculty_id: parseInt(facultyId),
        status: 'pending'
      }
    });
    res.json(query);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create query' });
  }
}

const addMessageToQuery = async (req, res) => {
  try {
    const { queryId } = req.params;
    const { message, senderId } = req.body;

    if (!queryId || !message || !senderId) {
      return res.status(400).json({ 
        error: 'Missing required fields' 
      });
    }

    const newMessage = await prisma.query_messages.create({
      data: {
        query_id: parseInt(queryId),
        sender_id: parseInt(senderId),
        message
      },
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
            college_uid: true
          }
        }
      }
    });

    await prisma.student_queries.update({
      where: {
        query_id: parseInt(queryId)
      },
      data: {
        status: 'answered',
        updated_at: new Date()
      }
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error in addMessageToQuery:', error);
    res.status(500).json({ 
      error: 'Failed to send message',
      details: error.message 
    });
  }
};

const updateQueryStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const query = await prisma.student_queries.update({
      where: {
        query_id: parseInt(req.params.queryId)
      },
      data: {
        status,
        updated_at: new Date()
      }
    });
    res.json(query);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update query status' });
  }
}

export { getQueryOfStudent, getQueryOfFaculty, createQuery, addMessageToQuery, updateQueryStatus };