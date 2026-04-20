import type { Request, Response, NextFunction } from "express";
import { loginDto, registerDto } from "../dtos/auth.dto.js";
import { authService } from "../services/auth.service.js";
import { userService } from "../services/user.service.js";

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const body = registerDto.parse(req.body);
      const result = await authService.register(body);
      res.status(201).json({ success: true, data: result });
    } catch (e) {
      next(e);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const body = loginDto.parse(req.body);
      const result = await authService.login(body);
      res.json({ success: true, data: result });
    } catch (e) {
      next(e);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
      }
      const profile = await userService.getProfile(req.user.sub);
      res.json({ success: true, data: profile });
    } catch (e) {
      next(e);
    }
  },
};
