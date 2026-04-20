import { Router } from "express";
import { adminController } from "../controllers/admin.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.js";

export const adminRouter = Router();

adminRouter.use(requireAuth, requireRole("ADMIN"));
adminRouter.get("/exam-sets", adminController.listExamSets);
adminRouter.get("/exam-sets/:id/pdf", adminController.downloadExamPdf);
