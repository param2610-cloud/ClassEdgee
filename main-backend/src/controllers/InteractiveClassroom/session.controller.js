import { PrismaClient } from "@prisma/client";
// get sessions
const getAllSession = async (req, res) => {
    try {
      const classes = await PrismaClient.classes.findMany({
        include: {
          courses: true,
          faculty: true,
          rooms: true,
          sections: true
        }
      });
      res.json(classes);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Create New Class (Session)
  const addSession = async (req, res) => {
    const { 
      course_id, 
      faculty_id, 
      room_id, 
      section_id, 
      slot_id, 
      semester, 
      academic_year, 
      start_date, 
      end_date 
    } = req.body;
  
    try {
      const newClass = await PrismaClient.classes.create({
        data: {
          course_id,
          faculty_id,
          room_id,
          section_id,
          slot_id,
          semester,
          academic_year,
          start_date: new Date(start_date),
          end_date: new Date(end_date),
          is_active: true
        }
      });
      res.json(newClass);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Update Class (Session)
  const updateSession = async (req, res) => {
    const { id } = req.params;
    const { 
      room_id, 
      slot_id, 
      start_date, 
      end_date, 
      is_active 
    } = req.body;
  
    try {
      const updatedClass = await PrismaClient.classes.update({
        where: { class_id: parseInt(id) },
        data: {
          room_id,
          slot_id,
          start_date: start_date ? new Date(start_date) : undefined,
          end_date: end_date ? new Date(end_date) : undefined,
          is_active,
          updated_at: new Date()
        }
      });
      res.json(updatedClass);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  
  // Delete Class (Session)
  const deleteSession = async (req, res) => {
    const { id } = req.params;
    
    try {
      await PrismaClient.classes.delete({
        where: { class_id: parseInt(id) }
      });
      res.json({ message: 'Class session deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

export {addSession, getAllSession, updateSession, deleteSession};