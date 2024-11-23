import e from 'express'
import { addStudentEngagement, deleteStudentEngagement, studentEngagement, updateStudentEngagement } from '../../controllers/InteractiveClassroom/analogistic.controller.js';


const router = e.Router();
router.get('/student-engagement',studentEngagement)
router.post('/add-student-engagement',addStudentEngagement)
router.put('/update-student-engagement/:id',updateStudentEngagement)
router.delete('/delete-student-engagement/:id',deleteStudentEngagement)
export default router