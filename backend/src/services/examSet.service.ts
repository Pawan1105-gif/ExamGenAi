import { AppError } from "../middlewares/errorHandler.js";
import type {
  CreateExamSetInput,
  ListExamSetsQuery,
  UpdateExamSetInput,
} from "../dtos/examSet.dto.js";
import { examSetRepository } from "../repositories/examSet.repository.js";
import { buildSourceMaterial } from "./noteExtract.service.js";
import { generateExamMarkdown } from "./openai.service.js";

const MAX_SOURCE_MATERIAL_CHARS = 100_000;

export const examSetService = {
  async generateAndCreate(
    userId: string,
    input: CreateExamSetInput,
    sourceParts: string[] = []
  ) {
    const sourceMaterial =
      sourceParts.length > 0
        ? buildSourceMaterial(sourceParts, MAX_SOURCE_MATERIAL_CHARS)
        : undefined;

    const content = await generateExamMarkdown({
      title: input.title,
      subject: input.subject,
      topic: input.topic,
      difficulty: input.difficulty,
      questionCount: input.questionCount,
      ...(sourceMaterial && sourceMaterial.length > 0 ? { sourceMaterial } : {}),
    });
    return examSetRepository.create({
      userId,
      title: input.title,
      subject: input.subject,
      topic: input.topic,
      difficulty: input.difficulty,
      questionCount: input.questionCount,
      content,
    });
  },

  async list(userId: string, query: ListExamSetsQuery) {
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await examSetRepository.listForUser(userId, {
      skip,
      take: query.limit,
      search: query.search,
      subject: query.subject,
    });
    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit) || 1,
    };
  },

  async getById(userId: string, role: string, id: string) {
    const row = await examSetRepository.findById(id);
    if (!row) {
      throw new AppError(404, "Exam set not found");
    }
    if (role !== "ADMIN" && row.userId !== userId) {
      throw new AppError(403, "Forbidden");
    }
    return row;
  },

  async update(userId: string, role: string, id: string, input: UpdateExamSetInput) {
    const row = await examSetRepository.findById(id);
    if (!row) {
      throw new AppError(404, "Exam set not found");
    }
    if (role !== "ADMIN" && row.userId !== userId) {
      throw new AppError(403, "Forbidden");
    }
    return examSetRepository.update(id, {
      ...(input.title !== undefined && { title: input.title }),
      ...(input.subject !== undefined && { subject: input.subject }),
      ...(input.topic !== undefined && { topic: input.topic }),
      ...(input.difficulty !== undefined && { difficulty: input.difficulty }),
      ...(input.questionCount !== undefined && {
        questionCount: input.questionCount,
      }),
      ...(input.content !== undefined && { content: input.content }),
    });
  },

  async remove(userId: string, role: string, id: string) {
    const row = await examSetRepository.findById(id);
    if (!row) {
      throw new AppError(404, "Exam set not found");
    }
    if (role !== "ADMIN" && row.userId !== userId) {
      throw new AppError(403, "Forbidden");
    }
    await examSetRepository.delete(id);
  },
};
