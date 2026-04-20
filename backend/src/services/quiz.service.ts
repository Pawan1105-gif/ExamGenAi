import { AppError } from "../middlewares/errorHandler.js";
import type { CreateQuizInput, SubmitQuizInput } from "../dtos/quiz.dto.js";
import { quizRepository } from "../repositories/quiz.repository.js";
import { examSetRepository } from "../repositories/examSet.repository.js";
import { nanoid } from "nanoid";

interface Question {
  index: number;
  stem: string;
  options: { [key: string]: string };
  correctAnswer: string;
}

function parseQuestionsFromContent(content: string): Question[] {
  const lines = content.split(/\r?\n/);
  const questions: Question[] = [];
  let currentQuestion: Partial<Question> | null = null;
  let currentOptions: { [key: string]: string } = {};
  let questionIndex = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Match question heading (Q1, Q2, etc)
    if (/^###\s+Q\d+\./i.test(trimmed)) {
      if (currentQuestion) {
        currentQuestion.options = currentOptions;
        questions.push(currentQuestion as Question);
      }
      currentQuestion = {
        index: questionIndex,
        stem: trimmed.replace(/^###\s+/, ""),
      };
      currentOptions = {};
      questionIndex++;
      continue;
    }

    if (!currentQuestion) continue;

    // Match options (A), B), C), D))
    const optionMatch = trimmed.match(/^([A-D])\)\s+(.+)/);
    if (optionMatch) {
      currentOptions[optionMatch[1]] = optionMatch[2];
      continue;
    }

    // Match answer
    if (/^\*\*Answer:\s*([A-D])\*\*/i.test(trimmed)) {
      const match = trimmed.match(/^\*\*Answer:\s*([A-D])\*\*/i);
      if (match) {
        currentQuestion.correctAnswer = match[1];
      }
      continue;
    }

    // If we have options but not answer yet, add to stem
    if (Object.keys(currentOptions).length === 0) {
      currentQuestion.stem += " " + trimmed;
    }
  }

  // Add last question
  if (currentQuestion && currentQuestion.correctAnswer) {
    currentQuestion.options = currentOptions;
    questions.push(currentQuestion as Question);
  }

  return questions;
}

export const quizService = {
  async createQuiz(adminId: string, input: CreateQuizInput) {
    // Verify exam set exists and belongs to admin
    const examSet = await examSetRepository.findById(input.examSetId);
    if (!examSet) {
      throw new AppError(404, "Exam set not found");
    }
    if (examSet.userId !== adminId) {
      throw new AppError(403, "You can only create quizzes from your own exam sets");
    }

    // Parse questions and validate selected indices
    const questions = parseQuestionsFromContent(examSet.content);
    for (const idx of input.selectedQuestions) {
      if (idx < 0 || idx >= questions.length) {
        throw new AppError(400, `Invalid question index: ${idx}`);
      }
    }

    // Generate unique code
    const uniqueCode = nanoid(8).toUpperCase();

    return quizRepository.create({
      ...input,
      adminId,
      uniqueCode,
    });
  },

  async getQuizByCode(uniqueCode: string) {
    const quiz = await quizRepository.findByUniqueCode(uniqueCode);
    if (!quiz) {
      throw new AppError(404, "Quiz not found. Please check the code.");
    }
    return quiz;
  },

  async submitQuiz(userId: string, input: SubmitQuizInput) {
    const quiz = await quizRepository.findById(input.quizId);
    if (!quiz) {
      throw new AppError(404, "Quiz not found");
    }

    // Parse questions from exam set
    const questions = parseQuestionsFromContent(quiz.examSet.content);
    const selectedQuestions = (quiz.selectedQuestions as number[]).map((idx) => questions[idx]);

    // Calculate score
    let score = 0;
    const answers = input.answers;

    for (const answer of answers) {
      const questionIndex = answer.questionIndex;
      if (
        questionIndex >= 0 &&
        questionIndex < selectedQuestions.length &&
        selectedQuestions[questionIndex].correctAnswer === answer.selectedAnswer
      ) {
        score += quiz.marksPerQuestion;
      }
    }

    // Save attempt
    return quizRepository.saveAttempt(input.quizId, userId, answers, score, input.timeTaken);
  },

  async getQuizAttempt(quizId: string, userId: string) {
    return quizRepository.getAttempt(quizId, userId);
  },

  async listQuizzesForAdmin(adminId: string) {
    return quizRepository.listForAdmin(adminId);
  },

  async listAttempts(quizId: string) {
    return quizRepository.listAttemptsForQuiz(quizId);
  },

  async getQuizById(quizId: string) {
    return quizRepository.findById(quizId);
  },

  getQuestionsForQuiz(examSet: any, selectedIndices: number[]) {
    const allQuestions = parseQuestionsFromContent(examSet.content);
    return selectedIndices.map((idx) => allQuestions[idx]);
  },
};
