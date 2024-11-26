// routes/timeslotRoutes.js
import e from "express";

const router = e.Router();
import { 
    createTimeSlot,
    deleteTimeSlot,
    getTimeSlots,
    getTimeSlotsByDay
} from "../controllers/timeslot.controller.js";

router.post('/', createTimeSlot);
router.delete('/:id', deleteTimeSlot);
router.get('/', getTimeSlots);
router.get('/day/:dayOfWeek', getTimeSlotsByDay);

export default router













