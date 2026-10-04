import { defineRoute } from "../../handlers/routes.js";
import { UnauthorizedError } from "../../shared/error.js";
import { ApiResponse } from "../../shared/utils/apiResponse.js";
import { getAdminByEmail } from "./admin.service.js";
import { credentails } from "./admin.validation.js";

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const adminLogin = defineRoute(async (req, res) => {
  try {
    const { email, password } = credentails.parse(req.body);

    const admin = await getAdminByEmail(email);

    const isValidPassword = await bcrypt.compare(password, admin.passwordHash);

    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const accessToken = jwt.sign(
      {
        sub: admin.id,
        email: admin.email,
        role: "ADMIN",
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      },
    );

    return ApiResponse.success(res, {
      statusCode: 200,
      message: "Admin login successful",
      data: {
        accessToken,
        admin: {
          id: admin.id,
          email: admin.email,
        },
      },
    });
  } catch (error) {
    console.log("Admin login error:", error);
    return ApiResponse.error(res, {
      message: "Admin login failed",
      statusCode: 500,
    });
  }
});
