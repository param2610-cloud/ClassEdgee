import e from "express";
import { createCoordinator } from "../controllers/coordinator.controller.js";
const router = e.Router();
router.post("/createcoordinator",createCoordinator);
export default router
