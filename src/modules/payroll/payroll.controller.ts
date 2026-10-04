import { defineRoute } from "../../handlers/defineRoute.js";
import { ApiResponse } from "../../shared/utils/apiResponse.js";
import { generateSummary } from "./payroll.service.js";
import { payrollSummarySchema } from "./payroll.validation.js";
export const summary = defineRoute(async (req, res) =>
  ApiResponse.success(res, {
    message: "Payroll attendance summary generated",
    data: await generateSummary(payrollSummarySchema.parse(req.body)),
  }),
);
