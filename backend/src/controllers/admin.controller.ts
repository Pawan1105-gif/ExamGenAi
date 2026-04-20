import type { Request, Response, NextFunction } from "express";
import { listExamSetsQuery } from "../dtos/examSet.dto.js";
import { adminService } from "../services/admin.service.js";

export const adminController = {
  async listExamSets(req: Request, res: Response, next: NextFunction) {
    try {
      const query = listExamSetsQuery.parse(req.query);
      const result = await adminService.listAllExamSets(query);
      res.json({ success: true, data: result });
    } catch (e) {
      next(e);
    }
  },
};
