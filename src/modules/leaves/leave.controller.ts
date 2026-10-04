import { AuthenticatedRequest } from "../../middleware/auth.js";
import { defineRoute } from "../../handlers/defineRoute.js";
import { ApiResponse } from "../../shared/utils/apiResponse.js";
import * as service from "./leave.service.js";
import {
  createLeaveSchema,
  leaveIdSchema,
  leaveListSchema,
} from "./leave.validation.js";
export const create = defineRoute(async (req, res) => {
  const result = await service.createLeave(createLeaveSchema.parse(req.body));
  if (result === "worker-not-found")
    return ApiResponse.error(res, {
      statusCode: 404,
      message: "Worker not found",
    });
  if (result === "overlap")
    return ApiResponse.error(res, {
      statusCode: 409,
      message: "Leave overlaps an existing request",
    });
  return ApiResponse.success(res, {
    statusCode: 201,
    message: "Leave request created",
    data: result,
  });
});
export const list = defineRoute(async (req, res) =>
  ApiResponse.success(res, {
    message: "Leave requests fetched",
    data: await service.listLeaves(leaveListSchema.parse(req.body)),
  }),
);
const decide = (approved: boolean) =>
  defineRoute(async (req: AuthenticatedRequest, res) => {
    const result = await service.decideLeave(
      leaveIdSchema.parse(req.params.id),
      req.admin!.id,
      approved,
    );
    return result
      ? ApiResponse.success(res, {
          message: `Leave ${approved ? "approved" : "rejected"}`,
          data: result,
        })
      : ApiResponse.error(res, {
          statusCode: 422,
          message: "Leave request is not pending",
        });
  });
export const approve = decide(true);
export const reject = decide(false);
