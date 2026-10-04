import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import * as controller from "./shift.controller.js";
const router = Router();
router.post(
  "/",
  authenticate,
  authorize("SUPER_ADMIN", "HR"),
  controller.create,
);
router.post("/search", authenticate, controller.list);
router.get("/:id", authenticate, controller.getById);
router.patch(
  "/:id",
  authenticate,
  authorize("SUPER_ADMIN", "HR"),
  controller.update,
);
router.post(
  "/assignments",
  authenticate,
  authorize("SUPER_ADMIN", "HR"),
  controller.assign,
);
router.get(
  "/workers/:workerId/history",
  authenticate,
  controller.workerHistory,
);
export default router;
