import "dotenv/config";

import bcrypt from "bcrypt";

import { PrismaClient, AdminRole } from "@prisma/client";

const prisma = new PrismaClient();

const departmentsData = [
  {
    name: "Fabrication",
  },
];

async function addDepartments() {
  for (const department of departmentsData) {
    // CHECK EXISTING DEPARTMENT
    const existingDepartment = await prisma.department.findUnique({
      where: {
        name: department.name,
      },
    });

    if (existingDepartment) {
      console.log(`Department ${department.name} already exists`);
      continue;
    } else {
      const result = await prisma.department.create({
        data: {
          name: department.name,
        },
      });

      console.log(`Department ${department.name} created successfully`);
      console.log(result);
    }
  }
}

async function main() {
  await addDepartments();
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
