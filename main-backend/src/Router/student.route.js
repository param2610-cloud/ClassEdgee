import e from "express";
import { createStudent, loginStudent,studentblukupload,listofstudent,editStudent,uniquestudent } from "../controllers/student.controller.js";
import { upload } from "../utils/multer.js";
const router = e.Router();
router.post("/createstudent",createStudent);
router.post("/studentbulkupload",upload.single("file") ,studentblukupload)
router.post("/studentlogin",loginStudent);
router.get("/list-of-student",listofstudent)
router.put("/edit/:id",editStudent)
router.get("/get-student/:id",uniquestudent)
export default router