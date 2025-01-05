import express from 'express'
import { createUnit, createUnitPrerequisite, getUnits } from '../../controllers/academy/unit.controller.js'
const router = express.Router()


router.post('/:subjectId',createUnit)
router.get('/:subjectId',getUnits)
router.post('/:unitId/prerequisites',createUnitPrerequisite)

export default router