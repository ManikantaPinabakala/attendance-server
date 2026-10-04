import { defineRoute } from "../../handlers/defineRoute.js";
import { AuthenticatedRequest } from "../../middleware/auth.js";
import { ApiResponse } from "../../shared/utils/apiResponse.js";
import * as service from "./auth.service.js";
import {
  changePasswordSchema,
  createAdminSchema,
  loginSchema,
} from "./auth.validation.js";


export const login = defineRoute(async (req, res) => {
  const result = await service.login(loginSchema.parse(req.body));
  return result
    ? ApiResponse.success(res, { message: "Login successful", data: result })
    : ApiResponse.error(res, {
        statusCode: 401,
        message: "Invalid email or password",
      });
});
export const profile = defineRoute(async (req: AuthenticatedRequest, res) =>
  ApiResponse.success(res, {
    message: "Profile fetched",
    data: await service.getProfile(req.admin!.id),
  }),
);
export const createAdmin = defineRoute(async (req, res) =>
  ApiResponse.success(res, {
    statusCode: 201,
    message: "Admin created",
    data: await service.createAdmin(createAdminSchema.parse(req.body)),
  }),
);
export const changePassword = defineRoute(
  async (req: AuthenticatedRequest, res) =>
    (await service.changePassword(
      req.admin!.id,
      changePasswordSchema.parse(req.body),
    ))
      ? ApiResponse.success(res, { message: "Password changed" })
      : ApiResponse.error(res, {
          statusCode: 400,
          message: "Current password is incorrect",
        }),
);
