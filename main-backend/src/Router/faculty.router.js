import e from "express";
import { createFaculty, loginfaculty,facultyblukupload,listoffaculty, deletefaculty, editFaculty, getUniqueFaculty } from "../controllers/faculty.controller.js";
import { upload } from "../utils/multer.js";
const router = e.Router();
router.post("/createfaculty",createFaculty);
router.post("/facultybulkupload",upload.single("file") ,facultyblukupload)
router.post("/facultylogin",loginfaculty);
router.get("/list-of-faculty",listoffaculty)
router.put("/edit/:id",editFaculty)
router.get("/get-faculty/:id",getUniqueFaculty)
router.delete("/delete-faculty/:id",deletefaculty)
export default router