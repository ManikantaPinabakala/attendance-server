import { z } from "zod";
import { createLeaveSchema, leaveListSchema } from "./leave.validation.js";
export type CreateLeaveInput = z.infer<typeof createLeaveSchema>;
export type LeaveListInput = z.infer<typeof leaveListSchema>;
