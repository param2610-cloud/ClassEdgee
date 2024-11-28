
import e from 'express';
const router = e.Router();

import { createRoom, getRoomsOnFloor, getRoomDetails, updateRoom, deleteRoom } from '../controllers/room.controller.js';


router.post('/', createRoom);
router.get('/floors/:floor_number/', getRoomsOnFloor);
router.get('/:room_id', getRoomDetails);
router.put('/:room_id', updateRoom);
router.delete('/:room_id', deleteRoom);







export default router 