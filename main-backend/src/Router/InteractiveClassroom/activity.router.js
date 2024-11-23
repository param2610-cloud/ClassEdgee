import e from 'express'
import { addActivity,getActivity } from '../../controllers/InteractiveClassroom/activity.controller';


const router = e.Router();

router.post('/addactivity',addActivity)
router.get('/getactivity',getActivity)
export default router;
