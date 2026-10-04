import { Prisma } from "@prisma/client";
import { prisma } from "../../shared/utils/prismaClient.js";
import { pageResult } from "../../shared/utils/pagination.js";
import {
  CreateShiftInput,
  ShiftListInput,
  UpdateShiftInput,
  WorkerShiftInput,
} from "./shift.types.js";
const toTime = (value: string) => {
  const [hour, minute] = value.split(":").map(Number);
  const date = new Date(Date.UTC(1970, 0, 1));
  date.setUTCHours(hour!, minute!, 0, 0);
  return date;
};
const shiftData = (input: CreateShiftInput | UpdateShiftInput) => ({
  ...input,
  ...(input.startTime ? { startTime: toTime(input.startTime) } : {}),
  ...(input.endTime ? { endTime: toTime(input.endTime) } : {}),
});
export const createShift = (input: CreateShiftInput) =>
  prisma.shift.create({
    data: { ...shiftData(input) } as unknown as Prisma.ShiftCreateInput,
  });
export const getShift = (id: string) =>
  prisma.shift.findUnique({ where: { id } });
export const updateShift = (id: string, input: UpdateShiftInput) =>
  prisma.shift.update({
    where: { id },
    data: shiftData(input) as unknown as Prisma.ShiftUpdateInput,
  });
export const listShifts = async ({
  page,
  limit,
  search,
  ...filters
}: ShiftListInput) => {
  const where: Prisma.ShiftWhereInput = {
    ...filters,
    ...(search ? { name: { contains: search, mode: "insensitive" } } : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.shift.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.shift.count({ where }),
  ]);
  return pageResult(items, page, limit, total);
};
export const assignWorkerShift = async (input: WorkerShiftInput) => {
  const conflict = await prisma.workerShift.findFirst({
    where: {
      workerId: input.workerId,
      effectiveFrom: { lte: input.effectiveTo ?? new Date("9999-12-31") },
      OR: [
        { effectiveTo: null },
        { effectiveTo: { gte: input.effectiveFrom } },
      ],
    },
  });
  if (conflict) return null;
  return prisma.workerShift.create({ data: input, include: { shift: true } });
};
export const getWorkerShiftHistory = (workerId: string) =>
  prisma.workerShift.findMany({
    where: { workerId },
    include: { shift: true },
    orderBy: { effectiveFrom: "desc" },
  });
