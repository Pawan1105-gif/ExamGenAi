import "dotenv/config";
import { z } from "zod";

const optionalKey = z
  .string()
  .optional()
  .transform((v: string | undefined) =>
    v == null || v.trim() === "" ? undefined : v.trim()
  );

const optionalString = z
  .string()
  .optional()
  .transform((v: string | undefined) =>
    v == null || v.trim() === "" ? undefined : v.trim()
  );

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  JWT_EXPIRES_IN: z.string().default("7d"),
  /**
   * Preferred AI provider.
   * - If set: we will use this provider only.
   * - If unset: we will fall back in this order: OpenAI -> Gemini -> Ollama.
   */
  AI_PROVIDER: z
    .enum(["openai", "gemini", "ollama", "mock"])
    .optional()
    .transform((v: "openai" | "gemini" | "ollama" | "mock" | undefined) =>
      v == null ? undefined : v
    ),
  OPENAI_API_KEY: optionalKey,
  GEMINI_API_KEY: optionalKey,
  /** e.g. gemini-2.0-flash */
  GEMINI_MODEL: z.string().default("gemini-2.0-flash"),
  /** Local Ollama server base URL (default http://127.0.0.1:11434) */
  OLLAMA_BASE_URL: z.string().default("http://127.0.0.1:11434"),
  /** Local Ollama model name (e.g. llama3.1:8b, qwen2.5:3b) */
  OLLAMA_MODEL: z.string().default("llama3.1:8b"),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
});

export type Env = z.infer<typeof envSchema>;

export const env: Env = envSchema.parse(process.env);
