-- CreateEnum
CREATE TYPE "EmploymentType" AS ENUM ('PERMANENT', 'CONTRACT', 'DAILY_WAGE', 'APPRENTICE');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE', 'WEEK_OFF', 'HOLIDAY');

-- CreateEnum
CREATE TYPE "PunchType" AS ENUM ('IN', 'OUT');

-- CreateEnum
CREATE TYPE "DeviceType" AS ENUM ('BIOMETRIC', 'MOBILE', 'FACE_TERMINAL', 'RFID');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "AttendanceMarkingType" AS ENUM ('SELF', 'SUPERVISOR', 'BIOMETRIC', 'FACE_SCAN', 'GPS');

-- CreateTable
CREATE TABLE "sites" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "geofenceRadiusMeters" INTEGER NOT NULL DEFAULT 100,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "designations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "designations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workers" (
    "id" TEXT NOT NULL,
    "employeeCode" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "departmentId" TEXT,
    "designationId" TEXT,
    "siteId" TEXT,
    "employmentType" "EmploymentType" NOT NULL DEFAULT 'PERMANENT',
    "joiningDate" TIMESTAMP(3) NOT NULL,
    "biometricId" TEXT,
    "faceId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shifts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startTime" TIME(0) NOT NULL,
    "endTime" TIME(0) NOT NULL,
    "graceInMinutes" INTEGER NOT NULL DEFAULT 10,
    "graceOutMinutes" INTEGER NOT NULL DEFAULT 10,
    "overtimeAfterMinutes" INTEGER NOT NULL DEFAULT 30,
    "isNightShift" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_shifts" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "shiftId" TEXT NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_devices" (
    "id" TEXT NOT NULL,
    "siteId" TEXT,
    "deviceName" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "type" "DeviceType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_logs" (
    "id" BIGSERIAL NOT NULL,
    "workerId" TEXT NOT NULL,
    "punchTime" TIMESTAMP(3) NOT NULL,
    "punchType" "PunchType" NOT NULL,
    "deviceId" TEXT,
    "latitude" DECIMAL(10,7),
    "longitude" DECIMAL(10,7),
    "selfieImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "attendanceDate" DATE NOT NULL,
    "checkIn" TIMESTAMP(3),
    "checkOut" TIMESTAMP(3),
    "status" "AttendanceStatus" NOT NULL DEFAULT 'PRESENT',
    "lateMinutes" INTEGER NOT NULL DEFAULT 0,
    "earlyExitMinutes" INTEGER NOT NULL DEFAULT 0,
    "overtimeMinutes" INTEGER NOT NULL DEFAULT 0,
    "markingType" "AttendanceMarkingType" NOT NULL DEFAULT 'SELF',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leave_requests" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "leaveType" TEXT NOT NULL,
    "fromDate" DATE NOT NULL,
    "toDate" DATE NOT NULL,
    "reason" TEXT,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leave_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "holidays" (
    "id" TEXT NOT NULL,
    "siteId" TEXT,
    "holidayName" TEXT NOT NULL,
    "holidayDate" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "holidays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payroll_attendance_summary" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "payrollMonth" TEXT NOT NULL,
    "presentDays" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "absentDays" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "overtimeHours" DECIMAL(6,2) NOT NULL DEFAULT 0,
    "payableDays" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payroll_attendance_summary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_corrections" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "attendanceId" TEXT NOT NULL,
    "requestedCheckIn" TIMESTAMP(3),
    "requestedCheckOut" TIMESTAMP(3),
    "reason" TEXT NOT NULL,
    "approvalStatus" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendance_corrections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contractors" (
    "id" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "contactPerson" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geofence_history" (
    "id" BIGSERIAL NOT NULL,
    "workerId" TEXT NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "eventTime" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "geofence_history_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "sites_name_idx" ON "sites"("name");

-- CreateIndex
CREATE UNIQUE INDEX "departments_name_key" ON "departments"("name");

-- CreateIndex
CREATE UNIQUE INDEX "designations_name_key" ON "designations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "workers_employeeCode_key" ON "workers"("employeeCode");

-- CreateIndex
CREATE INDEX "workers_employeeCode_idx" ON "workers"("employeeCode");

-- CreateIndex
CREATE INDEX "workers_departmentId_idx" ON "workers"("departmentId");

-- CreateIndex
CREATE INDEX "workers_designationId_idx" ON "workers"("designationId");

-- CreateIndex
CREATE INDEX "workers_siteId_idx" ON "workers"("siteId");

-- CreateIndex
CREATE INDEX "workers_isActive_idx" ON "workers"("isActive");

-- CreateIndex
CREATE INDEX "workers_joiningDate_idx" ON "workers"("joiningDate");

-- CreateIndex
CREATE INDEX "shifts_name_idx" ON "shifts"("name");

-- CreateIndex
CREATE INDEX "shifts_isNightShift_idx" ON "shifts"("isNightShift");

-- CreateIndex
CREATE INDEX "worker_shifts_workerId_idx" ON "worker_shifts"("workerId");

-- CreateIndex
CREATE INDEX "worker_shifts_shiftId_idx" ON "worker_shifts"("shiftId");

-- CreateIndex
CREATE INDEX "worker_shifts_effectiveFrom_idx" ON "worker_shifts"("effectiveFrom");

-- CreateIndex
CREATE INDEX "worker_shifts_effectiveTo_idx" ON "worker_shifts"("effectiveTo");

-- CreateIndex
CREATE UNIQUE INDEX "worker_shifts_workerId_shiftId_effectiveFrom_key" ON "worker_shifts"("workerId", "shiftId", "effectiveFrom");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_devices_serialNumber_key" ON "attendance_devices"("serialNumber");

-- CreateIndex
CREATE INDEX "attendance_devices_siteId_idx" ON "attendance_devices"("siteId");

-- CreateIndex
CREATE INDEX "attendance_devices_type_idx" ON "attendance_devices"("type");

-- CreateIndex
CREATE INDEX "attendance_devices_isActive_idx" ON "attendance_devices"("isActive");

-- CreateIndex
CREATE INDEX "attendance_logs_workerId_idx" ON "attendance_logs"("workerId");

-- CreateIndex
CREATE INDEX "attendance_logs_punchTime_idx" ON "attendance_logs"("punchTime");

-- CreateIndex
CREATE INDEX "attendance_logs_punchType_idx" ON "attendance_logs"("punchType");

-- CreateIndex
CREATE INDEX "attendance_logs_workerId_punchTime_idx" ON "attendance_logs"("workerId", "punchTime");

-- CreateIndex
CREATE INDEX "attendance_logs_deviceId_idx" ON "attendance_logs"("deviceId");

-- CreateIndex
CREATE INDEX "attendance_logs_createdAt_idx" ON "attendance_logs"("createdAt");

-- CreateIndex
CREATE INDEX "attendance_attendanceDate_idx" ON "attendance"("attendanceDate");

-- CreateIndex
CREATE INDEX "attendance_status_idx" ON "attendance"("status");

-- CreateIndex
CREATE INDEX "attendance_workerId_attendanceDate_idx" ON "attendance"("workerId", "attendanceDate");

-- CreateIndex
CREATE INDEX "attendance_checkIn_idx" ON "attendance"("checkIn");

-- CreateIndex
CREATE INDEX "attendance_checkOut_idx" ON "attendance"("checkOut");

-- CreateIndex
CREATE UNIQUE INDEX "attendance_workerId_attendanceDate_key" ON "attendance"("workerId", "attendanceDate");

-- CreateIndex
CREATE INDEX "leave_requests_workerId_idx" ON "leave_requests"("workerId");

-- CreateIndex
CREATE INDEX "leave_requests_fromDate_idx" ON "leave_requests"("fromDate");

-- CreateIndex
CREATE INDEX "leave_requests_toDate_idx" ON "leave_requests"("toDate");

-- CreateIndex
CREATE INDEX "leave_requests_approvalStatus_idx" ON "leave_requests"("approvalStatus");

-- CreateIndex
CREATE INDEX "leave_requests_workerId_fromDate_idx" ON "leave_requests"("workerId", "fromDate");

-- CreateIndex
CREATE INDEX "holidays_holidayDate_idx" ON "holidays"("holidayDate");

-- CreateIndex
CREATE INDEX "holidays_siteId_idx" ON "holidays"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "holidays_siteId_holidayDate_key" ON "holidays"("siteId", "holidayDate");

-- CreateIndex
CREATE INDEX "payroll_attendance_summary_workerId_idx" ON "payroll_attendance_summary"("workerId");

-- CreateIndex
CREATE INDEX "payroll_attendance_summary_payrollMonth_idx" ON "payroll_attendance_summary"("payrollMonth");

-- CreateIndex
CREATE INDEX "payroll_attendance_summary_generatedAt_idx" ON "payroll_attendance_summary"("generatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "payroll_attendance_summary_workerId_payrollMonth_key" ON "payroll_attendance_summary"("workerId", "payrollMonth");

-- CreateIndex
CREATE INDEX "attendance_corrections_workerId_idx" ON "attendance_corrections"("workerId");

-- CreateIndex
CREATE INDEX "attendance_corrections_attendanceId_idx" ON "attendance_corrections"("attendanceId");

-- CreateIndex
CREATE INDEX "attendance_corrections_approvalStatus_idx" ON "attendance_corrections"("approvalStatus");

-- CreateIndex
CREATE INDEX "contractors_companyName_idx" ON "contractors"("companyName");

-- CreateIndex
CREATE INDEX "geofence_history_workerId_idx" ON "geofence_history"("workerId");

-- CreateIndex
CREATE INDEX "geofence_history_eventTime_idx" ON "geofence_history"("eventTime");

-- CreateIndex
CREATE INDEX "geofence_history_workerId_eventTime_idx" ON "geofence_history"("workerId", "eventTime");

-- AddForeignKey
ALTER TABLE "workers" ADD CONSTRAINT "workers_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workers" ADD CONSTRAINT "workers_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "designations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workers" ADD CONSTRAINT "workers_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_shifts" ADD CONSTRAINT "worker_shifts_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_shifts" ADD CONSTRAINT "worker_shifts_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "shifts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_devices" ADD CONSTRAINT "attendance_devices_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_logs" ADD CONSTRAINT "attendance_logs_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "attendance_devices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance" ADD CONSTRAINT "attendance_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leave_requests" ADD CONSTRAINT "leave_requests_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "holidays" ADD CONSTRAINT "holidays_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payroll_attendance_summary" ADD CONSTRAINT "payroll_attendance_summary_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_corrections" ADD CONSTRAINT "attendance_corrections_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendance_corrections" ADD CONSTRAINT "attendance_corrections_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "attendance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geofence_history" ADD CONSTRAINT "geofence_history_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
