import { Router } from "express";
import { examSetController } from "../controllers/examSet.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { maybeUploadNotes } from "../middlewares/notesUpload.js";

export const examSetRouter = Router();

examSetRouter.use(requireAuth);

examSetRouter.post(
  "/generate",
  maybeUploadNotes,
  examSetController.generate
);
examSetRouter.get("/", examSetController.list);
examSetRouter.get("/:id", examSetController.getOne);
examSetRouter.patch("/:id", examSetController.update);
examSetRouter.delete("/:id", examSetController.remove);
examSetRouter.get("/:id/download", examSetController.downloadPdf);
examSetRouter.get("/:id/download/questions", examSetController.downloadQuestionsPdf);
