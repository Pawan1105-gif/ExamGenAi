import type { ExamSet, Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

export const examSetRepository = {
  async create(data: {
    userId: string;
    title: string;
    subject: string;
    topic: string;
    difficulty: string;
    questionCount: number;
    content: string;
  }): Promise<ExamSet> {
    return prisma.examSet.create({ data });
  },

  async findById(id: string): Promise<ExamSet | null> {
    return prisma.examSet.findUnique({ where: { id } });
  },

  async update(
    id: string,
    data: Prisma.ExamSetUpdateInput
  ): Promise<ExamSet> {
    return prisma.examSet.update({ where: { id }, data });
  },

  async delete(id: string): Promise<void> {
    await prisma.examSet.delete({ where: { id } });
  },

  async listForUser(
    userId: string,
    opts: {
      skip: number;
      take: number;
      search?: string;
      subject?: string;
    }
  ): Promise<{ items: ExamSet[]; total: number }> {
    const where: Prisma.ExamSetWhereInput = { userId };
    if (opts.search?.trim()) {
      const q = opts.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { topic: { contains: q, mode: "insensitive" } },
      ];
    }
    if (opts.subject?.trim()) {
      where.subject = { equals: opts.subject, mode: "insensitive" };
    }

    const [items, total] = await Promise.all([
      prisma.examSet.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: opts.skip,
        take: opts.take,
      }),
      prisma.examSet.count({ where }),
    ]);
    return { items, total };
  },

  async adminList(opts: {
    skip: number;
    take: number;
    search?: string;
  }): Promise<{ items: ExamSet[]; total: number }> {
    const where: Prisma.ExamSetWhereInput = {};
    if (opts.search?.trim()) {
      const q = opts.search.trim();
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { subject: { contains: q, mode: "insensitive" } },
      ];
    }
    const [items, total] = await Promise.all([
      prisma.examSet.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: opts.skip,
        take: opts.take,
      }),
      prisma.examSet.count({ where }),
    ]);
    return { items, total };
  },

  async count(): Promise<number> {
    return prisma.examSet.count();
  },

  async countThisMonth(): Promise<number> {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return prisma.examSet.count({
      where: { createdAt: { gte: start } },
    });
  },
};
