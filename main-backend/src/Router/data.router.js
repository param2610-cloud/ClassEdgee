import e from "express";
import { list_of_department } from "../controllers/data.controller.js";

const router = e.Router();
router.get("/list-of-department",list_of_department)

export default router