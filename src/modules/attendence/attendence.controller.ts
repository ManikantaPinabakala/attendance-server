import { AuthenticatedRequest } from "../../middleware/auth.js";
import { defineRoute } from "../../handlers/defineRoute.js";
import { ApiResponse } from "../../shared/utils/apiResponse.js";
import * as service from "./attendence.service.js";
import {
  attendanceIdSchema,
  attendanceListSchema,
  correctionListSchema,
  correctionSchema,
} from "./attendence.validation.js";
export const list = defineRoute(async (req, res) =>
  ApiResponse.success(res, {
    message: "Attendance fetched",
    data: await service.listAttendance(attendanceListSchema.parse(req.body)),
  }),
);
export const getById = defineRoute(async (req, res) => {
  const record = await service.getAttendance(
    attendanceIdSchema.parse(req.params.id),
  );
  return record
    ? ApiResponse.success(res, { message: "Attendance fetched", data: record })
    : ApiResponse.error(res, {
        statusCode: 404,
        message: "Attendance not found",
      });
});
export const createCorrection = defineRoute(async (req, res) => {
  const result = await service.createCorrection(
    correctionSchema.parse(req.body),
  );
  if (result === "invalid-attendance")
    return ApiResponse.error(res, {
      statusCode: 422,
      message: "Attendance does not belong to the worker",
    });
  if (result === "duplicate")
    return ApiResponse.error(res, {
      statusCode: 409,
      message: "A pending correction already exists",
    });
  return ApiResponse.success(res, {
    statusCode: 201,
    message: "Correction request created",
    data: result,
  });
});
export const listCorrections = defineRoute(async (req, res) =>
  ApiResponse.success(res, {
    message: "Corrections fetched",
    data: await service.listCorrections(correctionListSchema.parse(req.body)),
  }),
);
const decide = (approved: boolean) =>
  defineRoute(async (req: AuthenticatedRequest, res) => {
    const result = await service.decideCorrection(
      attendanceIdSchema.parse(req.params.id),
      req.admin!.id,
      approved,
    );
    return result
      ? ApiResponse.success(res, {
          message: `Correction ${approved ? "approved" : "rejected"}`,
          data: result,
        })
      : ApiResponse.error(res, {
          statusCode: 422,
          message: "Correction is not pending",
        });
  });
export const approveCorrection = decide(true);
export const rejectCorrection = decide(false);
