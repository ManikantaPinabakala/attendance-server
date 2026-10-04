import {
  AttendanceMarkingType,
  AttendanceStatus,
  PunchType,
} from "@prisma/client";
import { prisma } from "../../shared/utils/prismaClient.js";

const dayStart = (value: Date) =>
  new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );
const minutesOfDay = (value: Date) =>
  value.getUTCHours() * 60 + value.getUTCMinutes();

/** Rebuilds one daily record from immutable raw events. Controllers never calculate attendance. */
export async function processAttendance(workerId: string, eventTime: Date) {
  const attendanceDate = dayStart(eventTime);
  const nextDay = new Date(attendanceDate);
  nextDay.setUTCDate(nextDay.getUTCDate() + 1);
  const workerShift = await prisma.workerShift.findFirst({
    where: {
      workerId,
      effectiveFrom: { lte: eventTime },
      OR: [{ effectiveTo: null }, { effectiveTo: { gte: eventTime } }],
    },
    include: { shift: true },
    orderBy: { effectiveFrom: "desc" },
  });
  const windowEnd = new Date(nextDay);
  if (workerShift?.shift.isNightShift)
    windowEnd.setUTCDate(windowEnd.getUTCDate() + 1);
  const logs = await prisma.attendanceLog.findMany({
    where: { workerId, punchTime: { gte: attendanceDate, lt: windowEnd } },
    orderBy: { punchTime: "asc" },
  });
  const checkIn =
    logs.find((log) => log.punchType === PunchType.IN)?.punchTime ?? null;
  const checkOut =
    [...logs].reverse().find((log) => log.punchType === PunchType.OUT)
      ?.punchTime ?? null;
  const missingPunch = Boolean(checkIn) !== Boolean(checkOut);
  let lateMinutes = 0;
  let earlyExitMinutes = 0;
  let overtimeMinutes = 0;
  if (workerShift?.shift && checkIn) {
    const shift = workerShift.shift;
    const expectedIn = minutesOfDay(shift.startTime);
    const expectedOut =
      minutesOfDay(shift.endTime) + (shift.isNightShift ? 1440 : 0);
    const actualIn = minutesOfDay(checkIn);
    const actualOut = checkOut
      ? minutesOfDay(checkOut) +
        (shift.isNightShift && checkOut < checkIn ? 1440 : 0)
      : null;
    lateMinutes = Math.max(0, actualIn - expectedIn - shift.graceInMinutes);
    if (actualOut !== null) {
      earlyExitMinutes = Math.max(
        0,
        expectedOut - actualOut - shift.graceOutMinutes,
      );
      overtimeMinutes = Math.max(
        0,
        actualOut - expectedOut - shift.overtimeAfterMinutes,
      );
    }
  }
  const status: AttendanceStatus = missingPunch
    ? AttendanceStatus.PRESENT
    : AttendanceStatus.PRESENT;
  return prisma.attendance.upsert({
    where: { workerId_attendanceDate: { workerId, attendanceDate } },
    create: {
      workerId,
      attendanceDate,
      checkIn,
      checkOut,
      status,
      lateMinutes,
      earlyExitMinutes,
      overtimeMinutes,
      markingType: AttendanceMarkingType.BIOMETRIC,
      remarks: missingPunch ? "Missing punch" : null,
    },
    update: {
      checkIn,
      checkOut,
      status,
      lateMinutes,
      earlyExitMinutes,
      overtimeMinutes,
      remarks: missingPunch ? "Missing punch" : null,
    },
  });
}
