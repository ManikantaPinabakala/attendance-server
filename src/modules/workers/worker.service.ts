import { Prisma } from "@prisma/client";
import { prisma } from "../../shared/utils/prismaClient.js";
import { pageResult } from "../../shared/utils/pagination.js";
import {
  CreateWorkerInput,
  UpdateWorkerInput,
  WorkerListInput,
} from "./worker.types.js";

const include = {
  department: true,
  designation: true,
  site: true,
} satisfies Prisma.WorkerInclude;
export const createWorker = async (input: CreateWorkerInput) => {
  const duplicate = await prisma.worker.findFirst({
    where: {
      OR: [
        { employeeCode: input.employeeCode },
        ...(input.email ? [{ email: input.email }] : []),
        ...(input.phone ? [{ phone: input.phone }] : []),
        ...(input.biometricId ? [{ biometricId: input.biometricId }] : []),
        ...(input.faceId ? [{ faceId: input.faceId }] : []),
      ],
    },
  });
  if (duplicate) return null;
  return prisma.worker.create({ data: input, include });
};
export const getWorker = (id: string) =>
  prisma.worker.findUnique({ where: { id }, include });
export const updateWorker = (id: string, input: UpdateWorkerInput) =>
  prisma.worker.update({ where: { id }, data: input, include });
export const setWorkerStatus = (id: string, isActive: boolean) =>
  prisma.worker.update({ where: { id }, data: { isActive } });
export const listWorkers = async (input: WorkerListInput) => {
  const { page, limit, search, ...filters } = input;
  const where: Prisma.WorkerWhereInput = {
    ...filters,
    ...(search
      ? {
          OR: [
            { employeeCode: { contains: search, mode: "insensitive" } },
            { firstName: { contains: search, mode: "insensitive" } },
            { lastName: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.worker.findMany({
      where,
      include,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.worker.count({ where }),
  ]);
  return pageResult(items, page, limit, total);
};
