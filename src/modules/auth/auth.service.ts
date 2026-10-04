import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../../config.js";
import { prisma } from "../../shared/utils/prismaClient.js";
import {
  ChangePasswordInput,
  CreateAdminInput,
  LoginInput,
} from "./auth.types.js";
const publicAdmin = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  siteId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;
export const login = async (input: LoginInput) => {
  const admin = await prisma.admin.findUnique({
    where: { email: input.email },
    select: { ...publicAdmin, passwordHash: true },
  });
  if (
    !admin ||
    !admin.isActive ||
    !(await bcrypt.compare(input.password, admin.passwordHash))
  )
    return null;
  const accessToken = jwt.sign(
    { sub: admin.id, role: admin.role },
    env.JWT_SECRET,
    { expiresIn: "8h" },
  );
  const { passwordHash: _passwordHash, ...safeAdmin } = admin;
  return { accessToken, admin: safeAdmin };
};
export const getProfile = (id: string) =>
  prisma.admin.findUnique({ where: { id }, select: publicAdmin });
export const createAdmin = async (input: CreateAdminInput) =>
  prisma.admin.create({
    data: { ...input, passwordHash: await bcrypt.hash(input.password, 12) },
    select: publicAdmin,
  });
export const changePassword = async (
  id: string,
  input: ChangePasswordInput,
) => {
  const admin = await prisma.admin.findUnique({
    where: { id },
    select: { passwordHash: true },
  });
  if (
    !admin ||
    !(await bcrypt.compare(input.currentPassword, admin.passwordHash))
  )
    return false;
  await prisma.admin.update({
    where: { id },
    data: { passwordHash: await bcrypt.hash(input.newPassword, 12) },
  });
  return true;
};
