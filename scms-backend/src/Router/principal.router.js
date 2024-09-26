import e from "express";
import { principallogin } from "../controllers/principal.controller.js";
const router = e.Router();

router.post("/login",principallogin);



export default router