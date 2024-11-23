import e from "express";
import { createFaculty, loginfaculty,facultyblukupload,listoffaculty,editfaculty,uniquefaculty, deletefaculty } from "../controllers/faculty.controller.js";
import { upload } from "../utils/multer.js";
const router = e.Router();
router.post("/createfaculty",createFaculty);
router.post("/facultybulkupload",upload.single("file") ,facultyblukupload)
router.post("/facultylogin",loginfaculty);
router.get("/list-of-faculty",listoffaculty)
router.put("/edit/:id",editfaculty)
router.get("/get-faculty/:id",uniquefaculty)
router.delete("/delete-faculty/:id",deletefaculty)
export default router