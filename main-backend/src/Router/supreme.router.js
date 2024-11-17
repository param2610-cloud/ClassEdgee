import e from "express";
import { loginsupreme, coordinatorcreate, registersupreme } from "../controllers/supreme.controller.js";
const router = e.Router();

router.post("/register",registersupreme);
router.post("/login",loginsupreme);
router.post("/coordinator-create",coordinatorcreate);


export default router;