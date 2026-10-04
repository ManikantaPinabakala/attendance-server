import { AdminRole } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import env from "../config.js";
import { ApiResponse } from "../shared/utils/apiResponse.js";
import { prisma } from "../shared/utils/prismaClient.js";

export type AuthenticatedRequest = Request & {
  admin?: { id: string; role: AdminRole; siteId: string | null };
};

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token)
    return ApiResponse.error(res, {
      statusCode: 401,
      message: "Authentication required",
    });
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string };
    const admin = await prisma.admin.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, siteId: true, isActive: true },
    });
    if (!admin || !admin.isActive)
      return ApiResponse.error(res, {
        statusCode: 401,
        message: "Invalid or inactive account",
      });
    req.admin = { id: admin.id, role: admin.role, siteId: admin.siteId };
    next();
  } catch {
    return ApiResponse.error(res, {
      statusCode: 401,
      message: "Invalid or expired token",
    });
  }
}

export const authorize =
  (...roles: AdminRole[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction) =>
    !req.admin || !roles.includes(req.admin.role)
      ? ApiResponse.error(res, {
          statusCode: 403,
          message: "Insufficient permission",
        })
      : next();
