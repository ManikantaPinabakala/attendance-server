import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import * as controller from "./leave.controller.js";
const router = Router();
router.post("/", authenticate, controller.create);
router.post("/search", authenticate, controller.list);
router.patch(
  "/:id/approve",
  authenticate,
  authorize("SUPER_ADMIN", "HR", "SUPERVISOR"),
  controller.approve,
);
router.patch(
  "/:id/reject",
  authenticate,
  authorize("SUPER_ADMIN", "HR", "SUPERVISOR"),
  controller.reject,
);
export default router;
