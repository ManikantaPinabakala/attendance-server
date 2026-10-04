import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import { summary } from "./payroll.controller.js";
const router = Router();
router.post("/summary", authenticate, authorize("SUPER_ADMIN", "HR"), summary);
export default router;
