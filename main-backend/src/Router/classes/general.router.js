import e from "express";
import { getUniqueClass } from "../../controllers/classroom/classes.controller.js";
const router = e.Router();
router.get("/:class_id",getUniqueClass)
export default router