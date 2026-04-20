import type { Request, Response, NextFunction } from "express";
import { dashboardService } from "../services/dashboard.service.js";

export const dashboardController = {
  async stats(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) throw new Error("Unauthorized");
      const data = await dashboardService.getStats(req.user.sub, req.user.role);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },
};
