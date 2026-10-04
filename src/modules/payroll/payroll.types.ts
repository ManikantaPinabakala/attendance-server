import { z } from "zod";
import { payrollSummarySchema } from "./payroll.validation.js";
export type PayrollSummaryInput = z.infer<typeof payrollSummarySchema>;
