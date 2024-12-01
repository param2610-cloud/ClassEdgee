import e from "express";
import { createStudent, loginStudent,editStudent, deletestudent, studentblukupload, listOfStudents, uniqueStudent, listOfStudentsOfSection, listOfStudentsOfDepartment } from "../controllers/student.controller.js";
import { upload } from "../utils/multer.js";
const router = e.Router();
router.post("/createstudent",createStudent);
router.post("/studentbulkupload",upload.single("file") ,studentblukupload)
router.post("/login",loginStudent);
router.get("/list-of-student",listOfStudents)
router.put("/edit/:id",editStudent)
router.get("/get-student/:id",uniqueStudent)
router.delete("/delete-student/:id",deletestudent)
router.get("/list-of-student-of-section/:section_id",listOfStudentsOfSection)
router.get("/list-of-students-of-department/:department_id",listOfStudentsOfDepartment)

export default router