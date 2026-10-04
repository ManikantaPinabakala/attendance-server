import { z } from "zod";
import { paginationSchema } from "../../shared/utils/pagination.js";
const time = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must be HH:mm");
export const shiftIdSchema = z.string().uuid("Invalid shift id");
export const createShiftSchema = z.object({
  name: z.string().trim().min(1).max(100),
  startTime: time,
  endTime: time,
  graceInMinutes: z.number().int().min(0).max(180).default(10),
  graceOutMinutes: z.number().int().min(0).max(180).default(10),
  overtimeAfterMinutes: z.number().int().min(0).max(720).default(30),
  isNightShift: z.boolean().default(false),
  isActive: z.boolean().optional(),
});
export const updateShiftSchema = createShiftSchema.partial();
export const shiftListSchema = paginationSchema.extend({
  isNightShift: z.boolean().optional(),
  isActive: z.boolean().optional(),
  search: z.string().trim().max(100).optional(),
});
export const workerShiftSchema = z
  .object({
    workerId: z.string().uuid(),
    shiftId: z.string().uuid(),
    effectiveFrom: z.coerce.date(),
    effectiveTo: z.coerce.date().optional().nullable(),
  })
  .refine(
    (input) => !input.effectiveTo || input.effectiveTo >= input.effectiveFrom,
    {
      path: ["effectiveTo"],
      message: "effectiveTo cannot precede effectiveFrom",
    },
  );
