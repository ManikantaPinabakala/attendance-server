import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import * as controller from "./attendence.controller.js";
const router = Router();
router.post("/search", authenticate, controller.list); router.get("/:id", authenticate, controller.getById);
router.post("/corrections", authenticate, controller.createCorrection); router.post("/corrections/search", authenticate, authorize("SUPER_ADMIN", "HR", "SUPERVISOR"), controller.listCorrections);
router.patch("/corrections/:id/approve", authenticate, authorize("SUPER_ADMIN", "HR", "SUPERVISOR"), controller.approveCorrection); router.patch("/corrections/:id/reject", authenticate, authorize("SUPER_ADMIN", "HR", "SUPERVISOR"), controller.rejectCorrection);
export default router;
