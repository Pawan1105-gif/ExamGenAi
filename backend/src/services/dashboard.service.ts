import type { Role } from "@prisma/client";
import { examSetRepository } from "../repositories/examSet.repository.js";
import { userRepository } from "../repositories/user.repository.js";

export const dashboardService = {
  async getStats(userId: string, role: Role) {
    if (role === "ADMIN") {
      const [users, exams, examsThisMonth] = await Promise.all([
        userRepository.count(),
        examSetRepository.count(),
        examSetRepository.countThisMonth(),
      ]);
      return {
        role,
        totals: {
          users,
          examSets: exams,
          examSetsThisMonth: examsThisMonth,
        },
      };
    }
    const examCount = await userRepository.countExamSetsByUser(userId);
    return {
      role,
      totals: {
        myExamSets: examCount,
      },
    };
  },
};
