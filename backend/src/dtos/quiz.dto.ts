import { z } from "zod";

export const createQuizDto = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  examSetId: z.string().uuid(),
  selectedQuestions: z.array(z.number().int().min(0)), // array of question indices
  marksPerQuestion: z.number().int().min(1),
  timeLimit: z.number().int().min(1).optional(), // in minutes
});

export type CreateQuizInput = z.infer<typeof createQuizDto>;

export const submitQuizDto = z.object({
  quizId: z.string().uuid(),
  answers: z.array(
    z.object({
      questionIndex: z.number().int().min(0),
      selectedAnswer: z.enum(["A", "B", "C", "D"]),
    })
  ),
  timeTaken: z.number().int().min(0).optional(), // in seconds
});

export type SubmitQuizInput = z.infer<typeof submitQuizDto>;

export const joinQuizDto = z.object({
  uniqueCode: z.string().min(1),
});

export type JoinQuizInput = z.infer<typeof joinQuizDto>;
