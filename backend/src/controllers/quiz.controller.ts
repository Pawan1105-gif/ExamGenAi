import type { Request, Response, NextFunction } from "express";
import { createQuizDto, submitQuizDto, joinQuizDto } from "../dtos/quiz.dto.js";
import { quizService } from "../services/quiz.service.js";
import { AppError } from "../middlewares/errorHandler.js";

export const quizController = {
  // Admin: Create a new quiz
  async createQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error("Unauthorized");
      if (req.user.role !== "ADMIN") {
        throw new AppError(403, "Only admins can create quizzes");
      }

      const body = createQuizDto.parse(req.body);
      const quiz = await quizService.createQuiz(req.user.sub, body);

      res.status(201).json({
        success: true,
        data: quiz,
      });
    } catch (e) {
      next(e);
    }
  },

  // Admin: List all quizzes created by admin
  async listQuizzes(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error("Unauthorized");
      if (req.user.role !== "ADMIN") {
        throw new AppError(403, "Only admins can view quizzes");
      }

      const quizzes = await quizService.listQuizzesForAdmin(req.user.sub);

      res.json({
        success: true,
        data: quizzes,
      });
    } catch (e) {
      next(e);
    }
  },

  // Admin: Get quiz details
  async getQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error("Unauthorized");

      const quizId = String(req.params.id);
      const quiz = await quizService.getQuizByCode(quizId);

      if (req.user.role === "ADMIN" && quiz.adminId !== req.user.sub) {
        throw new AppError(403, "You can only view your own quizzes");
      }

      // Get questions for the quiz
      const selectedIndices = quiz.selectedQuestions as number[];
      const questions = quizService.getQuestionsForQuiz(quiz.examSet, selectedIndices);

      res.json({
        success: true,
        data: {
          ...quiz,
          questions: questions.map((q: any) => ({
            index: q.index,
            stem: q.stem,
            options: q.options,
          })),
        },
      });
    } catch (e) {
      next(e);
    }
  },

  // User: Get quiz by unique code (for joining)
  async getQuizByCode(req: Request, res: Response, next: NextFunction) {
    try {
      const code = Array.isArray(req.params.code)
        ? req.params.code[0]
        : String(req.params.code);
      const quiz = await quizService.getQuizByCode(code);

      // Get questions for the quiz
      const selectedIndices = quiz.selectedQuestions as number[];
      const questions = quizService.getQuestionsForQuiz(quiz.examSet, selectedIndices);

      res.json({
        success: true,
        data: {
          id: quiz.id,
          title: quiz.title,
          description: quiz.description,
          marksPerQuestion: quiz.marksPerQuestion,
          timeLimit: quiz.timeLimit,
          totalQuestions: selectedIndices.length,
          totalMarks: selectedIndices.length * quiz.marksPerQuestion,
          questions: questions.map((q: any) => ({
            index: q.index,
            stem: q.stem,
            options: q.options,
          })),
        },
      });
    } catch (e) {
      next(e);
    }
  },

  // User: Submit quiz answers
  async submitQuiz(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error("Unauthorized");

      const body = submitQuizDto.parse(req.body);
      const attempt = await quizService.submitQuiz(req.user.sub, body);

      // Get quiz to calculate total marks
      const quiz = await quizService.getQuizById(body.quizId);

      res.json({
        success: true,
        data: {
          score: attempt.score,
          totalMarks: quiz ? quiz.marksPerQuestion * (quiz.selectedQuestions as number[]).length : 0,
          submittedAt: attempt.submittedAt,
        },
      });
    } catch (e) {
      next(e);
    }
  },

  // User: Get their quiz attempt
  async getMyAttempt(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error("Unauthorized");

      const quizId = String(req.params.id);
      const attempt = await quizService.getQuizAttempt(quizId, req.user.sub);

      if (!attempt) {
        throw new AppError(404, "You have not attempted this quiz");
      }

      res.json({
        success: true,
        data: attempt,
      });
    } catch (e) {
      next(e);
    }
  },

  // Admin: Get all attempts for a quiz
  async getQuizAttempts(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error("Unauthorized");
      if (req.user.role !== "ADMIN") {
        throw new AppError(403, "Only admins can view attempts");
      }

      const quizId = String(req.params.id);
      const attempts = await quizService.listAttempts(quizId);

      res.json({
        success: true,
        data: attempts,
      });
    } catch (e) {
      next(e);
    }
  },
};
