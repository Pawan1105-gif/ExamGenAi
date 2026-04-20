import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middlewares/auth.js";

export const dashboardRouter = Router();

dashboardRouter.get("/stats", requireAuth, dashboardController.stats);
