import e from 'express'
import { getAllSession, addSession, updateSession, deleteSession } from '../../controllers/InteractiveClassroom/session.controller.js';

const router = e.Router();

router.get('/getsession',getAllSession);
router.post('/addsession',addSession);
router.put('/updateSession/:id',updateSession);
router.delete('/deleteSession/:id',deleteSession);

export default router;