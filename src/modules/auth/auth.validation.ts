import { AdminRole } from "@prisma/client";
import { z } from "zod";
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});
export const createAdminSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  phone: z.string().trim().max(30).optional(),
  role: z.nativeEnum(AdminRole),
  siteId: z.string().uuid().optional(),
});
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8),
  newPassword: z.string().min(8).max(100),
});
