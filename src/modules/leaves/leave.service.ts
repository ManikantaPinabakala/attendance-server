import { ApprovalStatus, AttendanceStatus } from "@prisma/client";
import { prisma } from "../../shared/utils/prismaClient.js";
import { pageResult } from "../../shared/utils/pagination.js";
import { CreateLeaveInput, LeaveListInput } from "./leave.types.js";
export const createLeave = async (input: CreateLeaveInput) => {
  const [worker, overlap] = await Promise.all([
    prisma.worker.findUnique({ where: { id: input.workerId } }),
    prisma.leaveRequest.findFirst({
      where: {
        workerId: input.workerId,
        approvalStatus: { in: ["PENDING", "APPROVED"] },
        fromDate: { lte: input.toDate },
        toDate: { gte: input.fromDate },
      },
    }),
  ]);
  if (!worker) return "worker-not-found" as const;
  return overlap
    ? ("overlap" as const)
    : prisma.leaveRequest.create({ data: input });
};
export const listLeaves = async ({ page, limit, ...where }: LeaveListInput) => {
  const [items, total] = await prisma.$transaction([
    prisma.leaveRequest.findMany({
      where,
      include: { worker: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.leaveRequest.count({ where }),
  ]);
  return pageResult(items, page, limit, total);
};
export const decideLeave = async (
  id: string,
  adminId: string,
  approved: boolean,
) =>
  prisma.$transaction(async (tx) => {
    const leave = await tx.leaveRequest.findUnique({ where: { id } });
    if (!leave || leave.approvalStatus !== ApprovalStatus.PENDING) return null;
    const result = await tx.leaveRequest.update({
      where: { id },
      data: {
        approvalStatus: approved
          ? ApprovalStatus.APPROVED
          : ApprovalStatus.REJECTED,
        approvedById: adminId,
        approvedAt: new Date(),
      },
    });
    if (approved)
      for (
        let date = new Date(leave.fromDate);
        date <= leave.toDate;
        date.setUTCDate(date.getUTCDate() + 1)
      )
        await tx.attendance.upsert({
          where: {
            workerId_attendanceDate: {
              workerId: leave.workerId,
              attendanceDate: new Date(date),
            },
          },
          create: {
            workerId: leave.workerId,
            attendanceDate: new Date(date),
            status: AttendanceStatus.LEAVE,
            remarks: "Approved leave",
          },
          update: { status: AttendanceStatus.LEAVE, remarks: "Approved leave" },
        });
    return result;
  });
