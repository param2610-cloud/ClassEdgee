import express from 'express';
import {
  getAllEquipment,
  getEquipmentById,
  createEquipment,
  updateEquipmentStatus,
  scheduleMaintenance,
  getEquipmentByRoom,
  updateEquipment
} from '../controllers/equipment.controller.js';

const router = express.Router();

router.get('/', getAllEquipment);
router.get('//:id', getEquipmentById);
router.post('/', createEquipment);
router.patch('//:id/status', updateEquipmentStatus);
router.post('//:id/maintenance', scheduleMaintenance);
router.get('/room/:room_id/equipment', getEquipmentByRoom);
router.patch('/:id', updateEquipment);

export default router;