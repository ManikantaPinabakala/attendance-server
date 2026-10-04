import { z } from "zod";
import {
  createWorkerSchema,
  updateWorkerSchema,
  workerListSchema,
} from "./worker.validation.js";
export type CreateWorkerInput = z.infer<typeof createWorkerSchema>;
export type UpdateWorkerInput = z.infer<typeof updateWorkerSchema>;
export type WorkerListInput = z.infer<typeof workerListSchema>;
