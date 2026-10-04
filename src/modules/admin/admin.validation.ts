import { z } from "zod";

export const credentails = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email address"),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
});

export type CredentialsValidation = z.infer<typeof credentails>;