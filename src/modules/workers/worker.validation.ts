import { z } from "zod";
import { EmploymentType } from "@prisma/client";

export const createWorkerSchema = z.object({
  employeeCode: z.string().min(1, "Employee code is required").max(50),
  firstName: z.string().min(1, "First name is required").max(100),
  lastName: z.string().max(100).optional(),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Invalid phone number")
    .optional(),

  email: z.email("Invalid email").optional(),
  departmentId: z.uuid("Invalid department id").optional(),
  designationId: z.uuid("Invalid designation id").optional(),
  siteId: z.uuid("Invalid site id").optional(),
  employmentType: z.enum(EmploymentType).optional(),
  joiningDate: z.coerce.date().refine((date) => !Number.isNaN(date.getTime()), {
    message: "Invalid joining date",
  }),
  biometricId: z.string().max(100).optional(),
  faceId: z.string().optional(),
  isActive: z.boolean().optional(),
});

export type CreateWorkerInput = z.infer<typeof createWorkerSchema>;

export const updateWorkerSchema = createWorkerSchema.partial();

export type UpdateWorkerInput = z.infer<typeof updateWorkerSchema>;