import express from 'express';
import { getInstitution } from '../controllers/institution.controller.js';

const router = express.Router();


router.get('/:institutionId', getInstitution);

export default router;