import { ApprovalStatus, AttendanceStatus } from "@prisma/client";
import { z } from "zod";
import { paginationSchema } from "../../shared/utils/pagination.js";
export const attendanceIdSchema = z.string().uuid("Invalid attendance id");
export const attendanceListSchema = paginationSchema.extend({
  workerId: z.string().uuid().optional(),
  status: z.nativeEnum(AttendanceStatus).optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  siteId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
});
export const correctionSchema = z.object({
  workerId: z.string().uuid(),
  attendanceId: z.string().uuid(),
  requestedCheckIn: z.coerce.date().optional().nullable(),
  requestedCheckOut: z.coerce.date().optional().nullable(),
  reason: z.string().trim().min(3).max(1000),
});
export const correctionListSchema = paginationSchema.extend({
  approvalStatus: z.nativeEnum(ApprovalStatus).optional(),
});
