import path from "path";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import { fileURLToPath } from "url";
import { env } from "./config/env.js";
import { swaggerSpec } from "./config/swagger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { adminRouter } from "./routes/admin.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { dashboardRouter } from "./routes/dashboard.routes.js";
import { examSetRouter } from "./routes/examSet.routes.js";
import { quizRouter } from "./routes/quiz.routes.js";
import { userRouter } from "./routes/user.routes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(",").map((s) => s.trim()),
      credentials: true,
    })
  );
  app.use(express.json({ limit: "2mb" }));

  const uploadsPath = path.join(__dirname, "..", "uploads");
  app.use("/uploads", express.static(uploadsPath));

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "examgenai-api" });
  });

  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api/docs.json", (_req, res) => res.json(swaggerSpec));

  app.use("/api/auth", authRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/exam-sets", examSetRouter);
  app.use("/api/quizzes", quizRouter);
  app.use("/api/users", userRouter);
  app.use("/api/admin", adminRouter);

  app.use((_req, res) => {
    res.status(404).json({ success: false, error: "Not found" });
  });

  app.use(errorHandler);

  return app;
}
