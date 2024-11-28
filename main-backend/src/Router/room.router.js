
import e from 'express';
const router = e.Router();

import { createRoom, getRoomsOnFloor, getRoomDetails, updateRoom, deleteRoom } from '../controllers/room.controller.js';


router.post('/', createRoom);
router.get('/floors/:floor_number', getRoomsOnFloor);
router.get('/:room_number', getRoomDetails);
router.put('/:room_number', updateRoom);
router.delete('/:room_number', deleteRoom);







export default router 