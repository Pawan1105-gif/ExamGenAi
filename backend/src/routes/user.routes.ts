import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.js";
import { uploadAvatar } from "../middlewares/upload.js";

export const userRouter = Router();

userRouter.use(requireAuth);
userRouter.patch("/me", userController.updateProfile);
userRouter.post(
  "/me/avatar",
  uploadAvatar.single("avatar"),
  userController.uploadAvatar
);
