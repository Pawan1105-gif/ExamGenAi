import { prisma } from "../lib/prisma.js";
import type { CreateQuizInput } from "../dtos/quiz.dto.js";

export const quizRepository = {
  async create(input: CreateQuizInput & { adminId: string; uniqueCode: string }) {
    return prisma.quiz.create({
      data: {
        title: input.title,
        description: input.description,
        adminId: input.adminId,
        examSetId: input.examSetId,
        selectedQuestions: input.selectedQuestions,
        marksPerQuestion: input.marksPerQuestion,
        timeLimit: input.timeLimit,
        uniqueCode: input.uniqueCode,
      },
      include: {
        examSet: true,
      },
    });
  },

  async findByUniqueCode(uniqueCode: string) {
    return prisma.quiz.findUnique({
      where: { uniqueCode },
      include: {
        examSet: true,
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  async findById(id: string) {
    return prisma.quiz.findUnique({
      where: { id },
      include: {
        examSet: true,
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  async listForAdmin(adminId: string) {
    return prisma.quiz.findMany({
      where: { adminId },
      include: {
        examSet: true,
        _count: {
          select: { attempts: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async saveAttempt(quizId: string, userId: string, answers: unknown, score: number, timeTaken?: number) {
    return prisma.quizAttempt.upsert({
      where: {
        quizId_userId: {
          quizId,
          userId,
        },
      },
      create: {
        quizId,
        userId,
        answers: answers as any,
        score,
        timeTaken,
      },
      update: {
        answers: answers as any,
        score,
        timeTaken,
        submittedAt: new Date(),
      },
    });
  },

  async getAttempt(quizId: string, userId: string) {
    return prisma.quizAttempt.findUnique({
      where: {
        quizId_userId: {
          quizId,
          userId,
        },
      },
    });
  },

  async listAttemptsForQuiz(quizId: string) {
    return prisma.quizAttempt.findMany({
      where: { quizId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });
  },
};
