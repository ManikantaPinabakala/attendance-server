import { z } from "zod";
export const payrollSummarySchema = z.object({
  workerId: z.string().uuid(),
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be YYYY-MM"),
});
