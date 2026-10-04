import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../../shared/utils/prismaClient.js";
import { pageResult } from "../../shared/utils/pagination.js";
import { processAttendance } from "../attendence/attendance.processor.js";
import {
  CreateDeviceInput,
  DeviceListInput,
  DevicePunchInput,
  UpdateDeviceInput,
} from "./device.types.js";

export const createDevice = async (input: CreateDeviceInput) => {
  const apiKey = crypto.randomBytes(32).toString("base64url");
  const device = await prisma.attendanceDevice.create({
    data: { ...input, apiKeyHash: await bcrypt.hash(apiKey, 12) },
    select: {
      id: true,
      deviceName: true,
      serialNumber: true,
      type: true,
      siteId: true,
      isActive: true,
      createdAt: true,
    },
  });
  return { device, apiKey };
};
export const listDevices = async ({
  page,
  limit,
  ...where
}: DeviceListInput) => {
  const [items, total] = await prisma.$transaction([
    prisma.attendanceDevice.findMany({
      where,
      include: { site: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.attendanceDevice.count({ where }),
  ]);
  return pageResult(items, page, limit, total);
};
export const updateDevice = (id: string, input: UpdateDeviceInput) =>
  prisma.attendanceDevice.update({ where: { id }, data: input });
type DeviceCredentialFields = {
  apiKeyHash?: string | null;
  lastHeartbeatAt?: Date | null;
  lastSyncAt?: Date | null;
};
const authenticateDevice = async (serial: string, key: string) => {
  const device = (await prisma.attendanceDevice.findUnique({
    where: { serialNumber: serial },
  })) as Awaited<ReturnType<typeof prisma.attendanceDevice.findUnique>> &
    DeviceCredentialFields;
  return device?.isActive &&
    device.apiKeyHash &&
    (await bcrypt.compare(key, device.apiKeyHash))
    ? device
    : null;
};
const updateDeviceSync = (id: string) =>
  prisma.attendanceDevice.update({
    where: { id },
    data: {
      lastHeartbeatAt: new Date(),
      lastSyncAt: new Date(),
    } as unknown as never,
  });
export const heartbeat = async (serial: string, key: string) => {
  const device = await authenticateDevice(serial, key);
  if (!device) return false;
  await updateDeviceSync(device.id);
  return true;
};
export const recordPunch = async (
  serial: string,
  key: string,
  input: DevicePunchInput,
) => {
  const device = await authenticateDevice(serial, key);
  if (!device) return { kind: "unauthorized" as const };
  const worker = await prisma.worker.findUnique({
    where: { employeeCode: input.employeeCode },
  });
  if (
    !worker?.isActive ||
    (device.siteId && worker.siteId && device.siteId !== worker.siteId)
  )
    return { kind: "invalid-worker" as const };
  const result = await prisma.$transaction(async (tx) => {
    if (input.deviceEventId) {
      const existing = await tx.attendanceLog.findFirst({
        where: { deviceId: device.id, deviceEventId: input.deviceEventId },
      });
      if (existing) return { duplicate: true, log: existing };
    }
    const log = await tx.attendanceLog.create({
      data: {
        workerId: worker.id,
        deviceId: device.id,
        punchTime: input.timestamp,
        punchType: input.punchType,
        deviceEventId: input.deviceEventId,
      },
    });
    await tx.attendanceDevice.update({
      where: { id: device.id },
      data: {
        lastHeartbeatAt: new Date(),
        lastSyncAt: new Date(),
      } as unknown as never,
    });
    return { duplicate: false, log };
  });
  if (!result.duplicate) await processAttendance(worker.id, input.timestamp);
  return { kind: "accepted" as const, ...result };
};
