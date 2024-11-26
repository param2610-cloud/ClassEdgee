import express from 'express'
import { createTopic, deleteSubject, deleteTopic, deleteUnit, getTopics } from '../../controllers/academy/topic.controller.js'
const router = express.Router()

router.post('/:unitId', createTopic)
router.get('/:unitId', getTopics)


router.delete('/:subjectId',deleteSubject)
router.delete('/:unitId',deleteUnit)
router.delete('/:topicId', deleteTopic)


export default router