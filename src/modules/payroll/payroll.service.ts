import { prisma } from "../../shared/utils/prismaClient.js";
import { PayrollSummaryInput } from "./payroll.types.js";
export const generateSummary = async (input: PayrollSummaryInput) => {
  const from = new Date(`${input.month}-01T00:00:00.000Z`);
  const to = new Date(
    Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + 1, 1),
  );
  const records = await prisma.attendance.findMany({
    where: { workerId: input.workerId, attendanceDate: { gte: from, lt: to } },
    select: { status: true, lateMinutes: true, overtimeMinutes: true },
  });
  const presentDays = records
    .filter((r) => r.status === "PRESENT" || r.status === "HALF_DAY")
    .reduce((sum, r) => sum + (r.status === "HALF_DAY" ? 0.5 : 1), 0);
  const leaveDays = records.filter((r) => r.status === "LEAVE").length;
  const absentDays = records.filter((r) => r.status === "ABSENT").length;
  const lateDays = records.filter((r) => r.lateMinutes > 0).length;
  const overtimeHours =
    records.reduce((sum, r) => sum + r.overtimeMinutes, 0) / 60;
  const summary = await prisma.payrollAttendanceSummary.upsert({
    where: {
      workerId_payrollMonth: {
        workerId: input.workerId,
        payrollMonth: input.month,
      },
    },
    create: {
      workerId: input.workerId,
      payrollMonth: input.month,
      presentDays,
      absentDays,
      overtimeHours,
      payableDays: presentDays + leaveDays,
    },
    update: {
      presentDays,
      absentDays,
      overtimeHours,
      payableDays: presentDays + leaveDays,
    },
  });
  return { ...summary, leaveDays, lateDays };
};
