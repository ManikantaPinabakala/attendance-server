import { EmploymentType } from "@prisma/client";
import { z } from "zod";
import { paginationSchema } from "../../shared/utils/pagination.js";

export const workerIdSchema = z.string().uuid("Invalid worker id");
export const createWorkerSchema = z.object({
  employeeCode: z.string().trim().min(1).max(50),
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(30).optional(),
  email: z.string().email().optional(),
  departmentId: z.string().uuid().optional(),
  designationId: z.string().uuid().optional(),
  siteId: z.string().uuid().optional(),
  employmentType: z.nativeEnum(EmploymentType).default("PERMANENT"),
  joiningDate: z.coerce.date(),
  biometricId: z.string().trim().max(100).optional(),
  faceId: z.string().trim().max(100).optional(),
  isActive: z.boolean().optional(),
});
export const updateWorkerSchema = createWorkerSchema
  .partial()
  .omit({ employeeCode: true });
export const workerListSchema = paginationSchema.extend({
  search: z.string().trim().max(100).optional(),
  siteId: z.string().uuid().optional(),
  departmentId: z.string().uuid().optional(),
  designationId: z.string().uuid().optional(),
  employmentType: z.nativeEnum(EmploymentType).optional(),
  isActive: z.boolean().optional(),
});
export const workerStatusSchema = z.object({ isActive: z.boolean() });
