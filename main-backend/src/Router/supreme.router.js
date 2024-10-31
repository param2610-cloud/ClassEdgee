import e from "express";
import { loginsupreme, principalcreate, registersupreme } from "../controllers/supreme.controller.js";
const router = e.Router();

router.post("/register",registersupreme);
router.post("/login",loginsupreme);
router.post("/principal-create",principalcreate);


export default router;