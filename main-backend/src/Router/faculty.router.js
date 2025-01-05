import e from "express";
import { createFaculty, loginfaculty,facultyblukupload,listoffaculty, deletefaculty, editFaculty, getUniqueFaculty, updateFacultyExpertise, deleteFacultyExpertise, getFacultyClasses,  } from "../controllers/faculty.controller.js";
import classesFacultyRouter from "./classes/facultyClasses.router.js";
import { upload } from "../utils/multer.js";
const router = e.Router();
router.post("/createfaculty",createFaculty);
router.post("/facultybulkupload",upload.single("file") ,facultyblukupload)
router.post("/login",loginfaculty);
router.get("/list-of-faculty",listoffaculty)
router.put("/edit/:id",editFaculty)
router.get("/get-faculty/:id",getUniqueFaculty)
router.delete("/delete-faculty/:id",deletefaculty)
router.patch("/:faculty_id/:subject_id/expertise", updateFacultyExpertise);
router.delete("/:faculty_id/:subject_id/expertise", deleteFacultyExpertise);
router.get("/get-faculty-classes/:facultyId",getFacultyClasses)
router.use("/classes/",classesFacultyRouter);

export default router