import PDFDocument from "pdfkit";
import slugify from "slugify";
import type { ExamSet } from "@prisma/client";

function safeFilename(name: string) {
  const base = slugify(name, { lower: true, strict: true, trim: true });
  return base.length > 0 ? base : "exam";
}

function stripMarkdown(md: string): string[] {
  const lines = md.split(/\r?\n/);
  return lines
    .map((l) =>
      l
        .replace(/^#{1,6}\s+/g, "") // headings
        .replace(/\*\*(.*?)\*\*/g, "$1") // bold
        .replace(/`([^`]+)`/g, "$1") // inline code
        .replace(/^\s*[-*+]\s+/g, "• ") // lists
        .trimEnd()
    )
    .filter((l) => l.trim().length > 0);
}

function extractQuestionsOnly(content: string): string[] {
  const lines = stripMarkdown(content);
  const questionLines: string[] = [];
  let collecting = true;
  for (const line of lines) {
    // Stop collecting when we hit an answer or explanation
    if (/^(Answer|Explanation|Solution):/i.test(line)) {
      collecting = false;
    }
    // Start collecting again when we hit a new question
    if (/^Q\d+\./i.test(line)) {
      collecting = true;
    }
    if (collecting) {
      questionLines.push(line);
    }
  }
  return questionLines;
}

export async function renderExamSetPdf(exam: ExamSet): Promise<{
  filename: string;
  buffer: Buffer;
}> {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    info: {
      Title: exam.title,
      Author: "ExamGen AI",
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(c as Buffer));

  const filename = `${safeFilename(exam.title)}.pdf`;

  // Header
  doc.fontSize(20).text(exam.title, { underline: false });
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .fillColor("#444444")
    .text(
      `${exam.subject} • ${exam.topic} • ${exam.difficulty.toUpperCase()} • ${
        exam.questionCount
      } questions`,
      { lineGap: 2 }
    );
  doc.moveDown(1);
  doc.fillColor("#000000");

  // Body (simple markdown-to-text)
  const lines = stripMarkdown(exam.content);
  doc.fontSize(12);
  for (const line of lines) {
    // Emphasize question lines like "Q1" / "### Q1"
    if (/^Q\d+\./i.test(line)) {
      doc.moveDown(0.3);
      doc.font("Helvetica-Bold").text(line, { lineGap: 3 });
      doc.font("Helvetica");
      continue;
    }
    doc.text(line, { lineGap: 3 });
  }

  doc.end();

  const buffer: Buffer = await new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  return { filename, buffer };
}

export async function renderExamSetQuestionsPdf(exam: ExamSet): Promise<{
  filename: string;
  buffer: Buffer;
}> {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
    info: {
      Title: `${exam.title} - Questions Only`,
      Author: "ExamGen AI",
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (c) => chunks.push(c as Buffer));

  const filename = `${safeFilename(exam.title)}-questions.pdf`;

  // Header
  doc.fontSize(20).text(`${exam.title} - Questions Only`, { underline: false });
  doc.moveDown(0.5);
  doc
    .fontSize(11)
    .fillColor("#444444")
    .text(
      `${exam.subject} • ${exam.topic} • ${exam.difficulty.toUpperCase()} • ${
        exam.questionCount
      } questions`,
      { lineGap: 2 }
    );
  doc.moveDown(1);
  doc.fillColor("#000000");

  // Body (questions only)
  const lines = extractQuestionsOnly(exam.content);
  doc.fontSize(12);
  for (const line of lines) {
    // Emphasize question lines like "Q1" / "### Q1"
    if (/^Q\d+\./i.test(line)) {
      doc.moveDown(0.3);
      doc.font("Helvetica-Bold").text(line, { lineGap: 3 });
      doc.font("Helvetica");
      continue;
    }
    doc.text(line, { lineGap: 3 });
  }

  doc.end();

  const buffer: Buffer = await new Promise((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  return { filename, buffer };
}

