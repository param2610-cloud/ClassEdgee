
import e from 'express';
const router = e.Router();
import { PrismaClient } from '@prisma/client';  
const prisma = new PrismaClient()

import { createRoom, getRoomsOnFloor, getRoomDetails, updateRoom, deleteRoom, fetchRoomList } from '../controllers/room.controller.js';


router.get('/list-of-rooms', async (req, res) => { 

    try {
        const rooms = await prisma.rooms.findMany()
        res.status(200).send({
            success: true,
            data: rooms
        })
  
    } catch (error) {
      console.error('Error fetching room details:', error);
      res.status(500).send({
        success: false,
        message: 'Failed to fetch room details',
        error: error.message
      });
    }
  })
router.post('/', createRoom);
router.get('/floors/:floor_number', getRoomsOnFloor);
router.get('/:room_number', getRoomDetails);
router.put('/:room_number', updateRoom);
router.delete('/:room_number', deleteRoom);






export default router 