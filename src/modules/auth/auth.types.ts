import { z } from "zod";
import {
  changePasswordSchema,
  createAdminSchema,
  loginSchema,
} from "./auth.validation.js";
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateAdminInput = z.infer<typeof createAdminSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
