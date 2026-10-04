import { defineRoute } from "../../handlers/defineRoute.js";
import { ApiResponse } from "../../shared/utils/apiResponse.js";
import * as service from "./shift.service.js";
import {
  createShiftSchema,
  shiftIdSchema,
  shiftListSchema,
  updateShiftSchema,
  workerShiftSchema,
} from "./shift.validation.js";
export const create = defineRoute(async (req, res) =>
  ApiResponse.success(res, {
    statusCode: 201,
    message: "Shift created",
    data: await service.createShift(createShiftSchema.parse(req.body)),
  }),
);
export const list = defineRoute(async (req, res) =>
  ApiResponse.success(res, {
    message: "Shifts fetched",
    data: await service.listShifts(shiftListSchema.parse(req.body)),
  }),
);
export const getById = defineRoute(async (req, res) => {
  const shift = await service.getShift(shiftIdSchema.parse(req.params.id));
  return shift
    ? ApiResponse.success(res, { message: "Shift fetched", data: shift })
    : ApiResponse.error(res, { statusCode: 404, message: "Shift not found" });
});
export const update = defineRoute(async (req, res) =>
  ApiResponse.success(res, {
    message: "Shift updated",
    data: await service.updateShift(
      shiftIdSchema.parse(req.params.id),
      updateShiftSchema.parse(req.body),
    ),
  }),
);
export const assign = defineRoute(async (req, res) => {
  const assignment = await service.assignWorkerShift(
    workerShiftSchema.parse(req.body),
  );
  return assignment
    ? ApiResponse.success(res, {
        statusCode: 201,
        message: "Shift assigned",
        data: assignment,
      })
    : ApiResponse.error(res, {
        statusCode: 409,
        message: "Shift assignment overlaps an existing assignment",
      });
});
export const workerHistory = defineRoute(async (req, res) =>
  ApiResponse.success(res, {
    message: "Worker shift history fetched",
    data: await service.getWorkerShiftHistory(
      shiftIdSchema.parse(req.params.workerId),
    ),
  }),
);
