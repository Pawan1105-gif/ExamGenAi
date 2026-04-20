import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from "openai";
import { env } from "../config/env.js";
import { AppError } from "../middlewares/errorHandler.js";

let openaiClient: OpenAI | null = null;
let geminiClient: GoogleGenerativeAI | null = null;

function getOpenAI(): OpenAI {
  if (!env.OPENAI_API_KEY) {
    throw new AppError(500, "OpenAI client requested but OPENAI_API_KEY is not set");
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return openaiClient;
}

function getGemini(): GoogleGenerativeAI {
  if (!env.GEMINI_API_KEY) {
    throw new AppError(500, "Gemini client requested but GEMINI_API_KEY is not set");
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return geminiClient;
}

function buildPrompt(params: {
  title: string;
  subject: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  sourceMaterial?: string;
}): string {
  const sourceBlock =
    params.sourceMaterial && params.sourceMaterial.trim().length > 0
      ? `

The learner provided the following study notes and materials. Base every question ONLY on concepts, facts, and wording that appear in this content (you may rephrase). If something is unclear, infer conservatively from this text only:

"""
${params.sourceMaterial.trim()}
"""
`
      : "";

  return `You are an expert educator. Create an exam-style practice set in clean Markdown.

Title: ${params.title}
Subject: ${params.subject}
Topic: ${params.topic}
Difficulty: ${params.difficulty}
Number of questions: ${params.questionCount}
${sourceBlock}

Requirements:
- Use ## for the main title and ### for each question.
- For each question provide: stem, 4 options labeled A-D, and the correct answer on a separate line as **Answer: X** where X is A, B, C, or D.
- Add a brief explanation after each answer as **Explanation:** ...
- No preamble—start directly with the exam content.`;
}

function mockGenerateFromPrompt(params: {
  title: string;
  subject: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  sourceMaterial?: string;
}): string {
  const seedText = (params.sourceMaterial || `${params.subject} ${params.topic}`)
    .replace(/\s+/g, " ")
    .trim();

  const keywords = Array.from(
    new Set(
      seedText
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(" ")
        .filter((w) => w.length >= 5 && !["about", "which", "their", "there", "these", "those", "because", "should", "would", "could"].includes(w))
    )
  ).slice(0, Math.max(6, params.questionCount * 2));

  const pick = (i: number) => keywords[i % Math.max(1, keywords.length)] || params.topic;
  const difficultyHint =
    params.difficulty === "easy"
      ? "foundational"
      : params.difficulty === "hard"
        ? "advanced"
        : "intermediate";

  const lines: string[] = [];
  lines.push(`## ${params.title}`);
  lines.push("");

  for (let i = 1; i <= params.questionCount; i++) {
    const k1 = pick(i * 2 - 2);
    const k2 = pick(i * 2 - 1);
    const correct = ["A", "B", "C", "D"][i % 4]!;

    lines.push(`### Q${i}. ${params.subject}: ${k1} and ${k2} (${difficultyHint})`);
    lines.push(`Which statement best matches the notes around **${k1}** and **${k2}**?`);
    lines.push("");
    lines.push(`A) ${k1} is primarily used to support ${k2} in the context of ${params.topic}.`);
    lines.push(`B) ${k2} is unrelated to ${k1}; they appear in different sections of ${params.topic}.`);
    lines.push(`C) ${k1} and ${k2} are interchangeable terms in ${params.subject}.`);
    lines.push(`D) ${k1} always prevents ${k2} regardless of conditions.`);
    lines.push("");
    lines.push(`**Answer: ${correct}**`);
    lines.push(
      `**Explanation:** This is a local demo generator (no external AI). It uses detected keywords from your uploaded/pasted notes to create consistent, editable questions.`
    );
    lines.push("");
  }

  return lines.join("\n").trim();
}

async function generateWithOllama(prompt: string): Promise<string> {
  // Ollama API: POST /api/generate { model, prompt, stream: false }
  // https://github.com/ollama/ollama/blob/main/docs/api.md
  const url = `${env.OLLAMA_BASE_URL.replace(/\/+$/, "")}/api/generate`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: env.OLLAMA_MODEL, prompt, stream: false }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new AppError(
      res.status,
      `Ollama request failed (${res.status}). ${text || "No response body."}`
    );
  }
  try {
    const json = JSON.parse(text) as { response?: string };
    const out = json.response?.trim();
    if (!out) throw new Error("Empty response");
    return out;
  } catch (e) {
    throw new AppError(
      502,
      `Ollama returned an invalid response. ${e instanceof Error ? e.message : String(e)}`
    );
  }
}

export async function generateExamMarkdown(params: {
  title: string;
  subject: string;
  topic: string;
  difficulty: string;
  questionCount: number;
  sourceMaterial?: string;
}): Promise<string> {
  const prompt = buildPrompt(params);

  // If user explicitly selected a provider, force it.
  if (env.AI_PROVIDER === "mock") {
    return mockGenerateFromPrompt(params);
  }
  if (env.AI_PROVIDER === "ollama") {
    return generateWithOllama(prompt);
  }
  if (env.AI_PROVIDER === "openai") {
    if (!env.OPENAI_API_KEY) {
      throw new AppError(503, "AI_PROVIDER=openai but OPENAI_API_KEY is not set");
    }
  }
  if (env.AI_PROVIDER === "gemini") {
    if (!env.GEMINI_API_KEY) {
      throw new AppError(503, "AI_PROVIDER=gemini but GEMINI_API_KEY is not set");
    }
  }

  if (env.OPENAI_API_KEY && env.AI_PROVIDER !== "gemini") {
    try {
      const openai = getOpenAI();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4096,
      });
      const text = completion.choices[0]?.message?.content?.trim();
      if (!text) {
        throw new AppError(502, "AI returned an empty response");
      }
      return text;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      throw new AppError(502, `OpenAI request failed: ${msg}`);
    }
  }

  if (env.GEMINI_API_KEY && env.AI_PROVIDER !== "openai") {
    try {
      const genAI = getGemini();
      const model = genAI.getGenerativeModel({
        model: env.GEMINI_MODEL,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      });
      const result = await model.generateContent(prompt);
      const text = result.response.text()?.trim();
      if (!text) {
        throw new AppError(502, "AI returned an empty response");
      }
      return text;
    } catch (e) {
      const anyErr = e as { status?: number; message?: string };
      const status = typeof anyErr?.status === "number" ? anyErr.status : undefined;
      const msg = e instanceof Error ? e.message : String(e);

      if (status === 429) {
        throw new AppError(
          429,
          `Gemini rate limit / quota exceeded. ${msg}`
        );
      }
      if (status && status >= 400 && status < 600) {
        throw new AppError(status, `Gemini request failed. ${msg}`);
      }
      throw new AppError(502, `Gemini request failed. ${msg}`);
    }
  }

  // If no cloud keys exist (or are disabled), use local Ollama as last fallback.
  try {
    return await generateWithOllama(prompt);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new AppError(
      503,
      `AI service is not configured. Configure OPENAI_API_KEY / GEMINI_API_KEY, or run Ollama locally and set OLLAMA_BASE_URL. Details: ${msg}`
    );
  }

  throw new AppError(
    503,
    "AI service is not configured. Set OPENAI_API_KEY and/or GEMINI_API_KEY in backend/.env (Google AI Studio keys use GEMINI_API_KEY)."
  );
}
