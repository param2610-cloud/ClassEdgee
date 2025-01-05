import e from "express";
import { loginCoordinator } from "../controllers/coordinator.controller.js";
const router = e.Router();
router.post("/login",loginCoordinator);
export default router
