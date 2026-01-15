import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../lib/db/prisma";

const main = async () => {
  const branchesData = [
    { name: "Jindabazar", code: "JIN" },
    { name: "Jalalpur", code: "JAL" },
  ];
  for (const branch of branchesData) {
    await prisma.branch.upsert({
      where: { code: branch.code },
      update: { name: branch.name },
      create: { ...branch },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set");
  }

  const hashed = await bcrypt.hash(adminPassword, 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: hashed, role: "SUPER_ADMIN" },
    create: {
      name: "SUPER ADMIN",
      username: adminEmail,
      email: adminEmail,
      password: hashed,
      role: "SUPER_ADMIN",
    },
  });
};

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
