import { ApprovalStatus, Prisma } from "@prisma/client";
import { prisma } from "../../shared/utils/prismaClient.js";
import { pageResult } from "../../shared/utils/pagination.js";
import {
  AttendanceListInput,
  CorrectionListInput,
  CreateCorrectionInput,
} from "./attendence.types.js";
export const listAttendance = async ({
  page,
  limit,
  fromDate,
  toDate,
  ...filters
}: AttendanceListInput) => {
  const where: Prisma.AttendanceWhereInput = {
    workerId: filters.workerId,
    status: filters.status,
    worker: { siteId: filters.siteId, departmentId: filters.departmentId },
    ...(fromDate || toDate
      ? { attendanceDate: { gte: fromDate, lte: toDate } }
      : {}),
  };
  const [items, total] = await prisma.$transaction([
    prisma.attendance.findMany({
      where,
      include: { worker: { include: { department: true, site: true } } },
      orderBy: { attendanceDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.attendance.count({ where }),
  ]);
  return pageResult(items, page, limit, total);
};
export const getAttendance = (id: string) =>
  prisma.attendance.findUnique({
    where: { id },
    include: { worker: true, corrections: true },
  });
export const createCorrection = async (input: CreateCorrectionInput) => {
  const attendance = await prisma.attendance.findUnique({
    where: { id: input.attendanceId },
  });
  if (!attendance || attendance.workerId !== input.workerId)
    return "invalid-attendance" as const;
  const exists = await prisma.attendanceCorrection.findFirst({
    where: {
      attendanceId: input.attendanceId,
      approvalStatus: ApprovalStatus.PENDING,
    },
  });
  return exists
    ? ("duplicate" as const)
    : prisma.attendanceCorrection.create({ data: input });
};
export const listCorrections = async ({
  page,
  limit,
  approvalStatus,
}: CorrectionListInput) => {
  const where = approvalStatus ? { approvalStatus } : {};
  const [items, total] = await prisma.$transaction([
    prisma.attendanceCorrection.findMany({
      where,
      include: { worker: true, attendance: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.attendanceCorrection.count({ where }),
  ]);
  return pageResult(items, page, limit, total);
};
export const decideCorrection = async (
  correctionId: string,
  adminId: string,
  approved: boolean,
) =>
  prisma.$transaction(async (tx) => {
    const correction = await tx.attendanceCorrection.findUnique({
      where: { id: correctionId },
    });
    if (!correction || correction.approvalStatus !== ApprovalStatus.PENDING)
      return null;
    if (approved)
      await tx.attendance.update({
        where: { id: correction.attendanceId },
        data: {
          checkIn: correction.requestedCheckIn,
          checkOut: correction.requestedCheckOut,
          remarks: "Updated through approved correction",
        },
      });
    const result = await tx.attendanceCorrection.update({
      where: { id: correctionId },
      data: {
        approvalStatus: approved
          ? ApprovalStatus.APPROVED
          : ApprovalStatus.REJECTED,
        approvedById: adminId,
        approvedAt: new Date(),
      },
    });
    await tx.attendanceAction.create({
      data: {
        adminId,
        workerId: correction.workerId,
        attendanceId: correction.attendanceId,
        actionType: approved ? "APPROVED_CORRECTION" : "REJECTED_CORRECTION",
        remarks: correction.reason,
      },
    });
    return result;
  });
