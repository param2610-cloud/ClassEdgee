import e from "express";
import { add_department, list_of_department, specific_department_details } from "../controllers/department.controller.js";


const router = e.Router();
router.get("/list-of-department",list_of_department)
router.get("/:department_id",specific_department_details)
router.post("/add-department",add_department)
export default router