import e from "express";
import { createStudent, loginStudent } from "../controllers/student.controller.js";
const router = e.Router();
router.post("/createstudent",createStudent);
router.post("/studentlogin",loginStudent);
export default router