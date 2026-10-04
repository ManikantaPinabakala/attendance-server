import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import * as controller from "./device.controller.js";
const router = Router();
router.post(
  "/",
  authenticate,
  authorize("SUPER_ADMIN", "HR", "DEVICE_OPERATOR"),
  controller.create,
);
router.post("/search", authenticate, controller.list);
router.patch(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN", "HR", "DEVICE_OPERATOR"),
  controller.update,
);
router.post("/heartbeat", controller.heartbeat);
router.post("/punch", controller.punch);
export default router;
