import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env.js";

const definition: swaggerJsdoc.Options["definition"] = {
    openapi: "3.0.0",
    info: {
      title: "ExamGen AI API",
      version: "1.0.0",
      description:
        "REST API for ExamGen AI — JWT auth, exam generation via OpenAI, CRUD for exam sets.",
    },
    servers: [
      { url: `http://localhost:${env.PORT}`, description: "Local" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
};

/** Minimal inline paths so Swagger works without JSDOM file scanning in ESM */
definition.paths = {
  "/api/auth/register": {
    post: {
      tags: ["Auth"],
      summary: "Register",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password", "name"],
              properties: {
                email: { type: "string", format: "email" },
                password: { type: "string", minLength: 8 },
                name: { type: "string" },
              },
            },
          },
        },
      },
      responses: { "201": { description: "Created" } },
    },
  },
  "/api/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login",
      security: [],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["email", "password"],
              properties: {
                email: { type: "string" },
                password: { type: "string" },
              },
            },
          },
        },
      },
      responses: { "200": { description: "OK" } },
    },
  },
  "/api/auth/me": {
    get: {
      tags: ["Auth"],
      summary: "Current user",
      responses: { "200": { description: "OK" } },
    },
  },
  "/api/dashboard/stats": {
    get: {
      tags: ["Dashboard"],
      summary: "Dashboard stats",
      responses: { "200": { description: "OK" } },
    },
  },
  "/api/exam-sets/generate": {
    post: {
      tags: ["Exam sets"],
      summary: "Generate exam with AI (JSON or multipart with note files)",
      description:
        "Send JSON as before, or multipart/form-data with the same fields plus optional pastedNotes and repeated files (PDF, TXT, PPT, PPTX).",
      requestBody: {
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: [
                "title",
                "subject",
                "topic",
                "difficulty",
                "questionCount",
              ],
              properties: {
                title: { type: "string" },
                subject: { type: "string" },
                topic: { type: "string" },
                difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                questionCount: { type: "integer", minimum: 1, maximum: 30 },
                pastedNotes: {
                  type: "string",
                  description: "Optional raw text to ground the exam",
                },
              },
            },
          },
          "multipart/form-data": {
            schema: {
              type: "object",
              required: [
                "title",
                "subject",
                "topic",
                "difficulty",
                "questionCount",
              ],
              properties: {
                title: { type: "string" },
                subject: { type: "string" },
                topic: { type: "string" },
                difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                questionCount: { type: "integer" },
                pastedNotes: { type: "string" },
                files: {
                  type: "array",
                  items: { type: "string", format: "binary" },
                },
              },
            },
          },
        },
      },
      responses: { "201": { description: "Created" } },
    },
  },
  "/api/exam-sets": {
    get: {
      tags: ["Exam sets"],
      summary: "List my exam sets (paginated, search/filter)",
      parameters: [
        { name: "page", in: "query", schema: { type: "integer" } },
        { name: "limit", in: "query", schema: { type: "integer" } },
        { name: "search", in: "query", schema: { type: "string" } },
        { name: "subject", in: "query", schema: { type: "string" } },
      ],
      responses: { "200": { description: "OK" } },
    },
  },
  "/api/exam-sets/{id}": {
    get: {
      tags: ["Exam sets"],
      summary: "Get one exam set",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { "200": { description: "OK" } },
    },
    patch: {
      tags: ["Exam sets"],
      summary: "Update exam set",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { "200": { description: "OK" } },
    },
    delete: {
      tags: ["Exam sets"],
      summary: "Delete exam set",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
      responses: { "204": { description: "No content" } },
    },
  },
  "/api/users/me": {
    patch: {
      tags: ["Users"],
      summary: "Update profile",
      responses: { "200": { description: "OK" } },
    },
  },
  "/api/users/me/avatar": {
    post: {
      tags: ["Users"],
      summary: "Upload avatar (multipart field: avatar)",
      requestBody: {
        content: {
          "multipart/form-data": {
            schema: { type: "object", properties: { avatar: { type: "string", format: "binary" } } },
          },
        },
      },
      responses: { "200": { description: "OK" } },
    },
  },
  "/api/admin/exam-sets": {
    get: {
      tags: ["Admin"],
      summary: "List all exam sets (admin)",
      responses: { "200": { description: "OK" } },
    },
  },
  "/api/admin/exam-sets/{id}/pdf": {
    get: {
      tags: ["Admin"],
      summary: "Download an exam set as PDF (admin)",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        "200": { description: "PDF file" },
        "404": { description: "Not found" },
      },
    },
  },
};

const options: swaggerJsdoc.Options = {
  definition,
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
