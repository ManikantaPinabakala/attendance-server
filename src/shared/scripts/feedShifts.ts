import "dotenv/config";

import bcrypt from "bcrypt";

import { PrismaClient, AdminRole } from "@prisma/client";

const prisma = new PrismaClient();

const shiftsData = [
  {
    name: "Morning Shift",
    startTime: new Date("1970-01-01T09:00:00Z"),
    endTime: new Date("1970-01-01T17:30:00Z"),
    isNightShift: false,
  },
];

async function addShifts() {
  for (const shift of shiftsData) {
    // CHECK EXISTING SHIFT
    const existingShift = await prisma.shift.findFirst({
      where: {
        name: shift.name,
      },
    });

    if (existingShift) {
      console.log(`Shift ${shift.name} already exists`);
      continue;
    } else {
      const result = await prisma.shift.create({
        data: {
          name: shift.name,
          startTime: shift.startTime,
          endTime: shift.endTime,
          isNightShift: shift.isNightShift,
        },
      });

      console.log(`Shift ${shift.name} created successfully`);
      console.log(result);
    }
  }
}

async function main() {
  await addShifts();
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
