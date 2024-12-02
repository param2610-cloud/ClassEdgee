// routes/timeslotRoutes.js
import e from "express";

import { 
    createTimeSlot,
    createTimeSlotBybatch,
    deleteTimeSlot,
    getTimeSlots,
    getTimeSlotsByDay,
    getTimeSlotsbySemAndYear
} from "../controllers/timeslot.controller.js";
const router = e.Router();

router.get('/', getTimeSlots);
router.post('/', createTimeSlot);
router.post('/batch', createTimeSlotBybatch);
router.delete('/:id', deleteTimeSlot);
router.get('/day/:dayOfWeek', getTimeSlotsByDay);

export default router













