import { addMessageToQuery, createQuery, getQueryOfFaculty, getQueryOfStudent, updateQueryStatus } from "../controllers/query.controller.js";
import e from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = e.Router();
router.get('/queries/student/:studentId', getQueryOfStudent);
  
  // Get queries for a faculty member
  router.get('/queries/faculty/:facultyId',getQueryOfFaculty);
  
  // Create a new query
  router.post('/queries', createQuery);
  
  // Add a message to a query
  router.post('/queries/:queryId/messages', async (req, res) => {
    const { message, senderId } = req.body;
    console.log(req.body);
    
    try {
      const newMessage = await prisma.query_messages.create({
        data: {
          query_id: parseInt(req.params.queryId),
          sender_id: parseInt(senderId),
          message
        }
      });
      
      // Update query status
      await prisma.student_queries.update({
        where: {
          query_id: parseInt(req.params.queryId)
        },
        data: {
          status: 'answered',
          updated_at: new Date()
        }
      });
      
      res.json(newMessage);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });
  router.get('/queries/:queryId/messages', async (req, res) => {
    const { queryId } = req.params;
    
    try {
      const queryMessages= await prisma.query_messages.findMany({
        where: {
          query_id: parseInt(queryId)
        }
      });
      
      res.json(queryMessages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });
  
  // Update query status
  router.patch('/queries/:queryId/status', updateQueryStatus);

  export default router;