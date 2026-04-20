import type { Express } from "express";
import path from "path";
import { PDFParse } from "pdf-parse";
import { OfficeParser } from "officeparser";
import { AppError } from "../middlewares/errorHandler.js";

const ALLOWED_EXT = new Set([".pdf", ".txt", ".ppt", ".pptx"]);

function extOf(name: string): string {
  return path.extname(name).toLowerCase();
}

function isAllowedFile(file: Express.Multer.File): boolean {
  const ext = extOf(file.originalname);
  if (ALLOWED_EXT.has(ext)) return true;
  const mt = file.mimetype.toLowerCase();
  return (
    mt === "application/pdf" ||
    mt === "text/plain" ||
    mt === "application/vnd.ms-powerpoint" ||
    mt ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  );
}

export function assertAllowedNoteFile(file: Express.Multer.File) {
  if (!isAllowedFile(file)) {
    throw new AppError(
      400,
      `Unsupported file type: ${file.originalname}. Use PDF, TXT, PPT, or PPTX.`
    );
  }
}

async function extractPdf(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    return (result.text ?? "").trim();
  } finally {
    await parser.destroy();
  }
}

async function extractPresentation(buffer: Buffer): Promise<string> {
  try {
    const ast = await OfficeParser.parseOffice(buffer);
    return ast.toText().trim();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new AppError(
      400,
      `Could not read presentation file. Try saving as PPTX. (${msg})`
    );
  }
}

export async function extractTextFromNoteFile(
  file: Express.Multer.File
): Promise<string> {
  assertAllowedNoteFile(file);
  const buffer = file.buffer;
  const ext = extOf(file.originalname);
  const mt = file.mimetype.toLowerCase();

  if (ext === ".txt" || mt === "text/plain") {
    return buffer.toString("utf8").trim();
  }

  if (ext === ".pdf" || mt === "application/pdf") {
    const text = await extractPdf(buffer);
    if (!text) {
      throw new AppError(
        400,
        `No text could be extracted from ${file.originalname}. The PDF may be scanned images only — try OCR or paste the text instead.`
      );
    }
    return text;
  }

  if (
    ext === ".pptx" ||
    ext === ".ppt" ||
    mt === "application/vnd.ms-powerpoint" ||
    mt ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ) {
    const text = await extractPresentation(buffer);
    if (!text) {
      throw new AppError(
        400,
        `No text extracted from ${file.originalname}. Add slide text or paste notes below.`
      );
    }
    return text;
  }

  throw new AppError(400, `Unsupported file: ${file.originalname}`);
}

export function buildSourceMaterial(parts: string[], maxChars: number): string {
  const joined = parts.filter((p) => p.trim().length > 0).join("\n\n---\n\n");
  if (joined.length <= maxChars) return joined;
  return (
    joined.slice(0, maxChars) +
    "\n\n[... content truncated for model context limit ...]"
  );
}
