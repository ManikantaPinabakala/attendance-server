import { NotFoundError } from "../../shared/error.js";
import { prisma } from "../../shared/utils/prismaClient.js";

export const getAdminByEmail = async (email: string) => {
  const result = await prisma.admin.findUnique({
    where: {
      email,
    },
    select: {
      id: true,
      email: true,
      passwordHash: true,
    },
  });

  if (!result) {
    throw new NotFoundError("Admin not found");
  }

  return result;
};
