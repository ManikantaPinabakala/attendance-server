import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const parsed = z
  .object({
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    PORT: z.coerce.number().int().positive().default(3000),
    CORS_ALLOWED_ORIGIN: z.string().default("http://localhost:3000"),
    DATABASE_URL: z.string().min(1),
    DIRECT_URL: z.string().min(1).optional(),
    JWT_SECRET: z.string().min(32).optional(),
    SECRET_KEY: z.string().min(1).optional(),
  })
  .parse(process.env);

const env = { ...parsed, JWT_SECRET: parsed.JWT_SECRET ?? parsed.SECRET_KEY! };
export default env;
