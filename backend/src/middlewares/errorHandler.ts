import type { NextFunction, Request, Response } from "express";
import type { MulterError } from "multer";
import { ZodError } from "zod";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code,
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: "Validation failed",
      details: err.flatten().fieldErrors,
    });
  }

  const multerErr = err as MulterError;
  if (multerErr?.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      error: "File too large (max 2MB)",
    });
  }
  if (err instanceof Error && err.message === "Only image files are allowed") {
    return res.status(400).json({ success: false, error: err.message });
  }
  if (
    err instanceof Error &&
    err.message.includes("Only PDF, TXT, PPT, and PPTX")
  ) {
    return res.status(400).json({ success: false, error: err.message });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    error: "Internal server error",
  });
}
