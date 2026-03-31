import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async ({ name, email, password }: any) => {
  console.log("REGISTER INPUT:", { name, email, hasPassword: Boolean(password) });

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  console.log("EXISTING USER:", existingUser);

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  const hashed = await bcrypt.hash(password, 10);
  console.log("HASH CREATED");

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: hashed,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  console.log("USER CREATED:", user);

  return user;
};

export const login = async ({ email, password }: any) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new Error("Invalid credentials");

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  return { token };
};