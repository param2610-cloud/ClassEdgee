import { createEmergency, getEmergencies, listOfAlerts, updateAlertStatus } from "../controllers/Emergency.controller.js";

import express from 'express';
const router = express.Router();


router.post('/create', createEmergency);
router.get('/get', getEmergencies);
router.get('/list-of-alert', listOfAlerts);
router.post('/:alertId', updateAlertStatus);
export default router;