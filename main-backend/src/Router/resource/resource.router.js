
import express from 'express';
import { createAssignment, getAssignments } from '../../controllers/resource/assignment.controller.js';
import { 
    createResource, 
    getResources, 
    updateResource, 
    deleteResource 
} from '../../controllers/resource/resource.controller.js';
import { upload } from '../../utils/multer.js';

const router = express.Router();

// Assignment routes
router.post('/assignments', createAssignment);
router.get('/assignments', getAssignments);

// Resource routes
router.post('/resources', upload.single('file'), createResource);
router.get('/resources', getResources);
router.put('/resources/:id', upload.single('file'), updateResource);
router.delete('/resources/:id', deleteResource);

export default router;

