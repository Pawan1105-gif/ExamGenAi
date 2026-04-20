import { listExamSetsQuery } from "../dtos/examSet.dto.js";
import type { z } from "zod";
import { examSetRepository } from "../repositories/examSet.repository.js";

type ListQuery = z.infer<typeof listExamSetsQuery>;

export const adminService = {
  async listAllExamSets(query: ListQuery) {
    const skip = (query.page - 1) * query.limit;
    const { items, total } = await examSetRepository.adminList({
      skip,
      take: query.limit,
      search: query.search,
    });
    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit) || 1,
    };
  },
};
