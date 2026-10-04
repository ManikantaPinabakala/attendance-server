import { defineRoute } from "../../handlers/defineRoute.js";
import { ApiResponse } from "../../shared/utils/apiResponse.js";
import {
  createWorkerSchema,
  updateWorkerSchema,
  workerIdSchema,
  workerListSchema,
  workerStatusSchema,
} from "./worker.validation.js";
import * as workerService from "./worker.service.js";

export const create = defineRoute(async (req, res) => {
  const worker = await workerService.createWorker(
    createWorkerSchema.parse(req.body),
  );
  return worker
    ? ApiResponse.success(res, {
        statusCode: 201,
        message: "Worker created",
        data: worker,
      })
    : ApiResponse.error(res, {
        statusCode: 409,
        message: "Worker identifier already exists",
      });
});
export const list = defineRoute(async (req, res) =>
  ApiResponse.success(res, {
    message: "Workers fetched",
    data: await workerService.listWorkers(workerListSchema.parse(req.body)),
  }),
);
export const getById = defineRoute(async (req, res) => {
  const worker = await workerService.getWorker(
    workerIdSchema.parse(req.params.id),
  );
  return worker
    ? ApiResponse.success(res, { message: "Worker fetched", data: worker })
    : ApiResponse.error(res, { statusCode: 404, message: "Worker not found" });
});
export const update = defineRoute(async (req, res) =>
  ApiResponse.success(res, {
    message: "Worker updated",
    data: await workerService.updateWorker(
      workerIdSchema.parse(req.params.id),
      updateWorkerSchema.parse(req.body),
    ),
  }),
);
export const setStatus = defineRoute(async (req, res) => {
  const isActive = workerStatusSchema.parse(req.body).isActive;
  return ApiResponse.success(res, {
    message: `Worker ${isActive ? "activated" : "deactivated"}`,
    data: await workerService.setWorkerStatus(
      workerIdSchema.parse(req.params.id),
      isActive,
    ),
  });
});
