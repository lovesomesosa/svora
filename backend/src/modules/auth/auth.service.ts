import { prisma } from "../../lib/prisma.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AppError } from "../../utils/app-error.js";

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export const RegisterInput = async ({
  name,
  email,
  password,
}: RegisterInput) => {
  console.log("REGISTER INPUT:", {
    name,
    email,
    hasPassword: Boolean(password),
  });

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  console.log("EXISTING USER:", existingUser);

  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
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

export const login = async ({ email, password }: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) throw new AppError("Invalid credentials", 400);

  const isValid = await bcrypt.compare(password, user.passwordHash);

  if (!isValid) throw new AppError("Invalid credentials", 400);

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" },
  );

  return { token };
};
