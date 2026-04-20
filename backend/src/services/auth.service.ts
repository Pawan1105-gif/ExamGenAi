import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { Role, User } from "@prisma/client";
import { env } from "../config/env.js";
import type { JwtPayload } from "../middlewares/auth.js";
import { AppError } from "../middlewares/errorHandler.js";
import type { LoginInput, RegisterInput } from "../dtos/auth.dto.js";
import { userRepository } from "../repositories/user.repository.js";

function signToken(user: User): string {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
  };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

function sanitizeUser(user: User) {
  const { passwordHash: _, ...rest } = user;
  return rest;
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError(409, "Email already registered");
    }
    const passwordHash = await bcrypt.hash(input.password, 12);
    const isFirstUser = (await userRepository.count()) === 0;
    const user = await userRepository.create({
      email: input.email,
      passwordHash,
      name: input.name,
      role: isFirstUser ? ("ADMIN" as Role) : "USER",
    });
    const token = signToken(user);
    return { user: sanitizeUser(user), token };
  },

  async login(input: LoginInput) {
    const user = await userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError(401, "Invalid email or password");
    }
    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new AppError(401, "Invalid email or password");
    }
    const token = signToken(user);
    return { user: sanitizeUser(user), token };
  },
};
