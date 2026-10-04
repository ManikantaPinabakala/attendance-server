import "dotenv/config";

import bcrypt from "bcrypt";

import { PrismaClient, AdminRole } from "@prisma/client";

const prisma = new PrismaClient();

// INPUT OBJECT
const adminData = {
  name: "Super Admin",
  email: "admin@attendance.com",
  password: "admin123",
  phone: "9440705361",
  role: AdminRole.SUPER_ADMIN,
};

async function addAdmin() {
  // CHECK EXISTING ADMIN
  const existingAdmin = await prisma.admin.findUnique({
    where: {
      email: adminData.email,
    },
  });

  if (existingAdmin) {
    console.log("Admin already exists");

    return;
  }

  const passwordHash = await bcrypt.hash(adminData.password, 10);

  const admin = await prisma.admin.create({
    data: {
      name: adminData.name,
      email: adminData.email,
      passwordHash,
      phone: adminData.phone,
      role: adminData.role,
    },
  });

  console.log("Admin created successfully");
  console.log(admin);
}

async function updateAdmin() {
  // FIND ADMIN
  const existingAdmin = await prisma.admin.findUnique({
    where: {
      email: adminData.email,
    },
  });

  if (!existingAdmin) {
    console.log("Admin not found");
    return;
  }

  // HASH PASSWORD
  const passwordHash = await bcrypt.hash(adminData.password, 10);

  // UPDATE ADMIN
  const updatedAdmin = await prisma.admin.update({
    where: {
      email: adminData.email,
    },
    data: {
      name: adminData.name,
      phone: adminData.phone,
      passwordHash,
      role: adminData.role,
    },
  });

  console.log("Admin updated successfully");

  console.log(updatedAdmin);
}

async function main() {
//   await addAdmin();
  await updateAdmin();
}

main()
  .catch((error) => {
    console.error(error);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
