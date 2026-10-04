import { DeviceType } from "@prisma/client";
import { z } from "zod";
import { paginationSchema } from "../../shared/utils/pagination.js";
export const deviceIdSchema = z.string().uuid("Invalid device id");
export const createDeviceSchema = z.object({
  deviceName: z.string().trim().min(1).max(120),
  serialNumber: z.string().trim().min(3).max(100),
  type: z.nativeEnum(DeviceType),
  siteId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
});
export const updateDeviceSchema = createDeviceSchema
  .partial()
  .omit({ serialNumber: true });
export const deviceListSchema = paginationSchema.extend({
  siteId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  type: z.nativeEnum(DeviceType).optional(),
});
export const heartbeatSchema = z.object({
  serialNumber: z.string().trim().min(3).max(100),
});
export const devicePunchSchema = z.object({
  employeeCode: z.string().trim().min(1).max(50),
  timestamp: z.coerce.date(),
  punchType: z.enum(["IN", "OUT"]),
  deviceEventId: z.string().trim().min(1).max(150).optional(),
});
