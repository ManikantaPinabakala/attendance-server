import {
  NextFunction,
  Request,
  RequestHandler,
  Response,
  Router,
} from "express";
import { ZodError } from "zod";
import authRoutes from "../modules/auth/auth.route.js";
import workerRoutes from "../modules/workers/worker.route.js";
import attendanceRoutes from "../modules/attendence/attendence.route.js";
import deviceRoutes from "../modules/devices/device.route.js";
import leaveRoutes from "../modules/leaves/leave.route.js";
import payrollRoutes from "../modules/payroll/payroll.route.js";
import shiftRoutes from "../modules/shifts/shift.route.js";
import { ApiResponse } from "../shared/utils/apiResponse.js";
import { defineRoute } from "./defineRoute.js";

const router = Router();

router.get(
  "/health",
  defineRoute((_req, res) =>
    ApiResponse.success(res, {
      message: "Service healthy",
      data: { status: "OK" },
    }),
  ),
);
router.use("/auth", authRoutes);
router.use("/workers", workerRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/devices", deviceRoutes);
router.use("/leaves", leaveRoutes);
router.use("/payroll", payrollRoutes);
router.use("/shifts", shiftRoutes);

router.use(
  (err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      return ApiResponse.error(res, {
        statusCode: 400,
        message: "Validation failed",
        errors: err.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
    }
    const code =
      typeof err === "object" && err && "code" in err
        ? (err as { code: string }).code
        : undefined;
    if (code === "P2002")
      return ApiResponse.error(res, {
        statusCode: 409,
        message: "A record with this value already exists",
      });
    if (code === "P2025")
      return ApiResponse.error(res, {
        statusCode: 404,
        message: "Record not found",
      });
    console.error("Unhandled API error", err);
    return ApiResponse.error(res, {
      statusCode: 500,
      message: "Internal server error",
    });
  },
);

export default router;
