import { prisma } from "../lib/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { SignUpInput, SignInInput } from "../Schemas/AuthSchema";

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function signup(data: SignUpInput) {
  const passwordHash = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      passwordHash,
    },
  });
  const { passwordHash: _, ...safeUser } = user;
  return safeUser;
}
export async function signin(data: SignInInput) {
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const checkedPassword = await bcrypt.compare(
    data.password,
    user.passwordHash
  );
  if (!checkedPassword) {
    throw new Error("Wrong password");
  }
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: "2h" }
  );

  const { passwordHash, ...safeUser } = user;
  return { user: safeUser, token };
}
