import type { Request, Response, NextFunction } from "express";
import { AppError } from "../middlewares/errorHandler.js";
import { updateProfileDto } from "../dtos/profile.dto.js";
import { userService } from "../services/user.service.js";

export const userController = {
  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error("Unauthorized");
      const body = updateProfileDto.parse(req.body);
      const profile = await userService.updateProfile(req.user.sub, body);
      res.json({ success: true, data: profile });
    } catch (e) {
      next(e);
    }
  },

  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error("Unauthorized");
      const file = req.file;
      if (!file) {
        throw new AppError(400, "No file uploaded");
      }
      const publicPath = `/uploads/${file.filename}`;
      const profile = await userService.setAvatarUrl(req.user.sub, publicPath);
      res.json({ success: true, data: profile });
    } catch (e) {
      next(e);
    }
  },
};
