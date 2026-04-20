import type { Request, Response, NextFunction } from "express";
import { listExamSetsQuery } from "../dtos/examSet.dto.js";
import { adminService } from "../services/admin.service.js";
import { examSetRepository } from "../repositories/examSet.repository.js";
import { AppError } from "../middlewares/errorHandler.js";
import { renderExamSetPdf } from "../services/pdf.service.js";

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

  async downloadExamPdf(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);
      const exam = await examSetRepository.findById(id);
      if (!exam) throw new AppError(404, "Exam set not found");

      const { filename, buffer } = await renderExamSetPdf(exam);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.status(200).send(buffer);
    } catch (e) {
      next(e);
    }
  },
};
