import type { Role, User } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  },

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  async create(data: {
    email: string;
    passwordHash: string;
    name: string;
    role?: Role;
  }): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
        name: data.name,
        role: data.role ?? "USER",
      },
    });
  },

  async update(
    id: string,
    data: { name?: string; avatarUrl?: string | null }
  ): Promise<User> {
    return prisma.user.update({ where: { id }, data });
  },

  async count(): Promise<number> {
    return prisma.user.count();
  },

  async countExamSetsByUser(userId: string): Promise<number> {
    return prisma.examSet.count({ where: { userId } });
  },
};
