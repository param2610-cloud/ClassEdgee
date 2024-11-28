import e from "express";
import { adminLogin, coordinatorcreate, registerInstitution,listOfCoordinators } from "../controllers/supreme.controller.js";
const router = e.Router();

router.post("/register",registerInstitution);
router.post("/login",adminLogin);
router.post("/coordinator-create",coordinatorcreate);
router.get("/coordinators", listOfCoordinators);


export default router;