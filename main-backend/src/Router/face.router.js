import express from "express";
import {
  getFaceJobStatus,
  queueFaceClassProcessing,
  queueFaceRegistration,
} from "../controllers/face.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = express.Router();

router.use(requireAuth);

router.post("/register", queueFaceRegistration);
router.post("/process-class", queueFaceClassProcessing);
router.get("/job/:jobId", getFaceJobStatus);

export default router;
