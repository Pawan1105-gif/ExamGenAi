import { z } from "zod";

export const pastedNotesSchema = z
  .string()
  .max(150_000, "Pasted notes are too long")
  .optional();

export const createExamSetDto = z.object({
  title: z.string().min(1).max(200),
  subject: z.string().min(1).max(120),
  topic: z.string().min(1).max(200),
  difficulty: z.enum(["easy", "medium", "hard"]),
  questionCount: z.coerce.number().int().min(1).max(30),
});

export const updateExamSetDto = createExamSetDto.partial().extend({
  content: z.string().min(1).optional(),
});

export const listExamSetsQuery = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().optional(),
  subject: z.string().optional(),
});

export type CreateExamSetInput = z.infer<typeof createExamSetDto>;
export type UpdateExamSetInput = z.infer<typeof updateExamSetDto>;
export type ListExamSetsQuery = z.infer<typeof listExamSetsQuery>;
