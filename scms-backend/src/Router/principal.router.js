import e from "express";
import { principallogin,principalAuthdataEmailSent, listOfPrincipals } from "../controllers/principal.controller.js";
const router = e.Router();

router.post("/login",principallogin);
router.post("/principal-data-email-send",principalAuthdataEmailSent);
router.get("/list-of-principals",listOfPrincipals);


export default router