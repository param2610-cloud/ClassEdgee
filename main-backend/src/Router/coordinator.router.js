import e from "express";
import { createCoordinator,loginCoordinator } from "../controllers/coordinator.controller.js";
const router = e.Router();
router.post("/login",loginCoordinator);
router.post("/createcoordinator",createCoordinator);
export default router
