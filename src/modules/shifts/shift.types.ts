import { z } from "zod";
import {
  createShiftSchema,
  shiftListSchema,
  updateShiftSchema,
  workerShiftSchema,
} from "./shift.validation.js";
export type CreateShiftInput = z.infer<typeof createShiftSchema>;
export type UpdateShiftInput = z.infer<typeof updateShiftSchema>;
export type ShiftListInput = z.infer<typeof shiftListSchema>;
export type WorkerShiftInput = z.infer<typeof workerShiftSchema>;
