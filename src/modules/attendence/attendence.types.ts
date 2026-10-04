import { z } from "zod";
import {
  attendanceListSchema,
  correctionListSchema,
  correctionSchema,
} from "./attendence.validation.js";
export type AttendanceListInput = z.infer<typeof attendanceListSchema>;
export type CreateCorrectionInput = z.infer<typeof correctionSchema>;
export type CorrectionListInput = z.infer<typeof correctionListSchema>;
