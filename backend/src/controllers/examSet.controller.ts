import type { Request, Response, NextFunction } from "express";
import {
  createExamSetDto,
  listExamSetsQuery,
  pastedNotesSchema,
  updateExamSetDto,
} from "../dtos/examSet.dto.js";
import { extractTextFromNoteFile } from "../services/noteExtract.service.js";
import { examSetService } from "../services/examSet.service.js";
import { renderExamSetPdf, renderExamSetQuestionsPdf } from "../services/pdf.service.js";

export const examSetController = {
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error("Unauthorized");

      const pasted = pastedNotesSchema.parse(
        req.body.pastedNotes === "" || req.body.pastedNotes === undefined
          ? undefined
          : String(req.body.pastedNotes)
      );

      const body = createExamSetDto.parse({
        title: req.body.title,
        subject: req.body.subject,
        topic: req.body.topic,
        difficulty: req.body.difficulty,
        questionCount: req.body.questionCount,
      });

      const sourceParts: string[] = [];
      if (pasted?.trim()) {
        sourceParts.push(`--- Pasted notes ---\n${pasted.trim()}`);
      }

      const files = (req.files as Express.Multer.File[] | undefined) ?? [];
      for (const file of files) {
        const text = await extractTextFromNoteFile(file);
        sourceParts.push(`--- File: ${file.originalname} ---\n${text}`);
      }

      const created = await examSetService.generateAndCreate(
        req.user.sub,
        body,
        sourceParts
      );
      res.status(201).json({ success: true, data: created });
    } catch (e) {
      next(e);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error("Unauthorized");
      const query = listExamSetsQuery.parse(req.query);
      const result = await examSetService.list(req.user.sub, query);
      res.json({ success: true, data: result });
    } catch (e) {
      next(e);
    }
  },

  async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error("Unauthorized");
      const id = String(req.params.id);
      const row = await examSetService.getById(req.user.sub, req.user.role, id);
      res.json({ success: true, data: row });
    } catch (e) {
      next(e);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error("Unauthorized");
      const id = String(req.params.id);
      const body = updateExamSetDto.parse(req.body);
      const row = await examSetService.update(req.user.sub, req.user.role, id, body);
      res.json({ success: true, data: row });
    } catch (e) {
      next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error("Unauthorized");
      const id = String(req.params.id);
      await examSetService.remove(req.user.sub, req.user.role, id);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  },

  async downloadPdf(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error("Unauthorized");
      const id = String(req.params.id);
      const row = await examSetService.getById(req.user.sub, req.user.role, id);
      const { filename, buffer } = await renderExamSetPdf(row);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (e) {
      next(e);
    }
  },

  async downloadQuestionsPdf(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error("Unauthorized");
      const id = String(req.params.id);
      const row = await examSetService.getById(req.user.sub, req.user.role, id);
      const { filename, buffer } = await renderExamSetQuestionsPdf(row);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (e) {
      next(e);
    }
  },
};
