import e from "express";
import { add_department, add_hod_to_department, list_of_department, list_of_faculty, list_of_faculty_for_department, specific_department_details } from "../controllers/department.controller.js";


const router = e.Router();
router.get("/list-of-department",list_of_department)
router.get("/:department_id/:institute_id",specific_department_details)
router.post("/add-department",add_department)
router.get("/list-of-faculty/:department_id/:institute_id",list_of_faculty)
router.get("/list-of-faculty_of_department/:department_id/:institute_id",list_of_faculty_for_department)
router.post("/add-hod/:department_id/:institute_id",add_hod_to_department)
export default router