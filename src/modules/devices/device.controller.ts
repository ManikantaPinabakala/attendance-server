import { defineRoute } from "../../handlers/defineRoute.js";
import { ApiResponse } from "../../shared/utils/apiResponse.js";
import * as service from "./device.service.js";
import {
  createDeviceSchema,
  deviceIdSchema,
  deviceListSchema,
  devicePunchSchema,
  heartbeatSchema,
  updateDeviceSchema,
} from "./device.validation.js";
export const create = defineRoute(async (req, res) =>
  ApiResponse.success(res, {
    statusCode: 201,
    message:
      "Device registered. Store the API key securely; it will not be shown again.",
    data: await service.createDevice(createDeviceSchema.parse(req.body)),
  }),
);
export const list = defineRoute(async (req, res) =>
  ApiResponse.success(res, {
    message: "Devices fetched",
    data: await service.listDevices(deviceListSchema.parse(req.body)),
  }),
);
export const update = defineRoute(async (req, res) =>
  ApiResponse.success(res, {
    message: "Device updated",
    data: await service.updateDevice(
      deviceIdSchema.parse(req.params.id),
      updateDeviceSchema.parse(req.body),
    ),
  }),
);
export const heartbeat = defineRoute(async (req, res) => {
  const key = req.header("x-device-key");
  if (
    !key ||
    !(await service.heartbeat(
      heartbeatSchema.parse(req.body).serialNumber,
      key,
    ))
  )
    return ApiResponse.error(res, {
      statusCode: 401,
      message: "Invalid device credentials",
    });
  return ApiResponse.success(res, { message: "Heartbeat accepted" });
});
export const punch = defineRoute(async (req, res) => {
  const serial = req.header("x-device-serial");
  const key = req.header("x-device-key");
  if (!serial || !key)
    return ApiResponse.error(res, {
      statusCode: 401,
      message: "Device credentials required",
    });
  const result = await service.recordPunch(
    serial,
    key,
    devicePunchSchema.parse(req.body),
  );
  if (result.kind === "unauthorized")
    return ApiResponse.error(res, {
      statusCode: 401,
      message: "Invalid device credentials",
    });
  if (result.kind === "invalid-worker")
    return ApiResponse.error(res, {
      statusCode: 422,
      message: "Worker is unavailable for this device",
    });
  return ApiResponse.success(res, {
    statusCode: result.duplicate ? 200 : 201,
    message: result.duplicate
      ? "Duplicate event already processed"
      : "Punch accepted",
    data: { id: result.log.id.toString() },
  });
});
