import { 
    createFireAlert,
    getActiveAlerts,
    getLatestFireAlert,
    resolveAlert,
    getNotifications
} from '../controllers/Emergency.controller.js';


const router = express.Router();

router.post('/', createFireAlert);

router.get('/alerts/active', getActiveAlerts);
router.get('/alerts/latest-fire', getLatestFireAlert);
router.put('/alerts/:alert_id/resolve', resolveAlert);
router.get('/notifications', getNotifications);