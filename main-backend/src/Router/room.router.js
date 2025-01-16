import e from 'express';
const router = e.Router();
import { PrismaClient } from '@prisma/client';  
const prisma = new PrismaClient()

import { 
  createRoom, getRoomsOnFloor, getRoomDetails, updateRoom, 
  deleteRoom, fetchRoomList, createBuilding, getBuildings,
  updateRoomMaintenance, getRoomsByBuilding, updateBuilding, // Add updateBuilding import
  updateRoomStatus 
} from '../controllers/room.controller.js';

router.get('/list-of-rooms', fetchRoomList);
router.post('/', createRoom);
router.get('/floors/:floor_number', getRoomsOnFloor);
router.get('/room_details/:room_number', getRoomDetails);
router.put('/:room_number', updateRoom);
router.delete('/:room_number', deleteRoom);

router.post('/buildings', createBuilding);
router.get('/buildings',async (req, res) => {
  try {
    console.log('Fetching buildings...');
    
    const buildings = await prisma.buildings.findMany({
      include: {
        rooms: true
      }
    });
    res.status(200).json({ success: true, data: buildings });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
router.get('/buildings/:building_id/rooms', getRoomsByBuilding);
router.patch('/:room_number/maintenance', updateRoomMaintenance);
router.patch('/buildings/:building_id', updateBuilding); 
router.patch('/:room_number/status', updateRoomStatus);

export default router