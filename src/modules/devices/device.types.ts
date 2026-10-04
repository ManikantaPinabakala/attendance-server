import { z } from "zod";
import {
  createDeviceSchema,
  deviceListSchema,
  devicePunchSchema,
  updateDeviceSchema,
} from "./device.validation.js";
export type CreateDeviceInput = z.infer<typeof createDeviceSchema>;
export type UpdateDeviceInput = z.infer<typeof updateDeviceSchema>;
export type DeviceListInput = z.infer<typeof deviceListSchema>;
export type DevicePunchInput = z.infer<typeof devicePunchSchema>;
