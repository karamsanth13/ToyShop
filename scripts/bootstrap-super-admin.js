import bcrypt from "bcrypt";
import { prisma } from "../server/db/prisma.js";

const { BOOTSTRAP_ADMIN_EMAIL: email, BOOTSTRAP_ADMIN_PASSWORD: password, BOOTSTRAP_ADMIN_NAME: fullName } = process.env;
try {
  if (!email || !password || !fullName || password.length < 12) throw new Error("Set bootstrap email, name, and a password of at least 12 characters.");
  if (await prisma.adminProfile.count({ where: { role: "Super Admin" } })) throw new Error("A Super Admin already exists; bootstrap refused.");
  await prisma.adminProfile.create({ data: { email: email.toLowerCase(), fullName, passwordHash: await bcrypt.hash(password, 12), role: "Super Admin" } });
  console.log("Super Admin created.");
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { await prisma.$disconnect(); }
