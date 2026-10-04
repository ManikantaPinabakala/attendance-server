import { ApprovalStatus } from "@prisma/client";
import { z } from "zod";
import { paginationSchema } from "../../shared/utils/pagination.js";
export const leaveIdSchema = z.string().uuid("Invalid leave id");
export const createLeaveSchema = z
  .object({
    workerId: z.string().uuid(),
    leaveType: z.string().trim().min(1).max(50),
    fromDate: z.coerce.date(),
    toDate: z.coerce.date(),
    reason: z.string().trim().max(1000).optional(),
  })
  .refine((value) => value.toDate >= value.fromDate, {
    path: ["toDate"],
    message: "toDate must not be before fromDate",
  });
export const leaveListSchema = paginationSchema.extend({
  approvalStatus: z.nativeEnum(ApprovalStatus).optional(),
  workerId: z.string().uuid().optional(),
});
