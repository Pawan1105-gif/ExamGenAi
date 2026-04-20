import type { NextFunction, Request, Response } from "express";
import multer from "multer";

const memory = multer.memoryStorage();

const allowedMime = new Set([
  "application/pdf",
  "text/plain",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
]);

function allowedFile(file: Express.Multer.File): boolean {
  if (allowedMime.has(file.mimetype)) return true;
  return /\.(pdf|txt|ppt|pptx)$/i.test(file.originalname);
}

const notesMulter = multer({
  storage: memory,
  limits: { fileSize: 15 * 1024 * 1024, files: 8 },
  fileFilter: (_req, file, cb) => {
    if (!allowedFile(file)) {
      cb(
        new Error(
          "Only PDF, TXT, PPT, and PPTX uploads are allowed for study notes."
        )
      );
      return;
    }
    cb(null, true);
  },
});

/** Runs multer when the client sends multipart/form-data; otherwise passes through (JSON body). */
export function maybeUploadNotes(req: Request, res: Response, next: NextFunction) {
  const ct = req.headers["content-type"];
  const contentType = Array.isArray(ct) ? ct[0] : ct ?? "";
  if (contentType.includes("multipart/form-data")) {
    notesMulter.array("files", 8)(req, res, (err) => {
      if (err) {
        next(err);
        return;
      }
      next();
    });
    return;
  }
  next();
}
