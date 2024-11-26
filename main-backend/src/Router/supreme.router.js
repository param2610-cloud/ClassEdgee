import e from "express";
import { adminLogin, coordinatorcreate, registerInstitution } from "../controllers/supreme.controller.js";
const router = e.Router();

router.post("/register",registerInstitution);
router.post("/login",adminLogin);
router.post("/coordinator-create",coordinatorcreate);


export default router;