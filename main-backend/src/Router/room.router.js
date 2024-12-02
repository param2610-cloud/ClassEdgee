
import e from 'express';
const router = e.Router();

import { createRoom, getRoomsOnFloor, getRoomDetails, updateRoom, deleteRoom, list_of_room } from '../controllers/room.controller.js';


router.post('/', createRoom);
router.get('/floors/:floor_number', getRoomsOnFloor);
router.get("/list-of-room",list_of_room)
router.get('/:room_number', getRoomDetails);
router.put('/:room_number', updateRoom);
router.delete('/:room_number', deleteRoom);







export default router 