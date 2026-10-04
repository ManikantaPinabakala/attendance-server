import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth.js";
import * as controller from "./auth.controller.js";
const router = Router();
router.post("/login", controller.login);
router.get("/profile", authenticate, controller.profile);
router.post(
  "/admins",
  authenticate,
  authorize("SUPER_ADMIN"),
  controller.createAdmin,
);
router.patch("/change-password", authenticate, controller.changePassword);
export default router;
