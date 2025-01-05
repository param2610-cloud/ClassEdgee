import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
//Create feedback
const createFeedback = async (req, res) => {
    const { 
      sender_id, 
      receiver_id, 
      feedback_type, 
      entity_id, 
      rating, 
      comments,
      anonymous 
    } = req.body;
  
    try {
      const feedback = await PrismaClient.feedback.create({
        data: {
          sender_id,
          receiver_id,
          feedback_type,
          entity_id,
          rating,
          comments,
          anonymous
        }
      });
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
//Get feedback
const getFeedback = async (req, res) => {
    try {
      const feedbacks = await PrismaClient.feedback.findMany({
        include: {
          users_feedback_sender_idTousers: {
            select: { first_name: true, last_name: true }
          },
          users_feedback_receiver_idTousers: {
            select: { first_name: true, last_name: true }
          }
        }
      });
      res.json(feedbacks);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

export{
    createFeedback,
    getFeedback
}