import { Router } from "express";
import { quizController } from "../controllers/quiz.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

export const quizRouter = Router();

// POST and specific routes first
quizRouter.post("/", requireAuth, requireRole("ADMIN"), quizController.createQuiz);
quizRouter.post("/submit", requireAuth, quizController.submitQuiz);

// Specific path routes (before :id)
quizRouter.get("/admin/list", requireAuth, requireRole("ADMIN"), quizController.listQuizzes);
quizRouter.get("/code/:code", quizController.getQuizByCode);

// Generic :id routes last (most specific first)
quizRouter.get("/:id/attempts", requireAuth, requireRole("ADMIN"), quizController.getQuizAttempts);
quizRouter.get("/:id/my-attempt", requireAuth, quizController.getMyAttempt);
quizRouter.get("/:id", requireAuth, quizController.getQuiz);
