import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middlewares/auth.js";
import { csrfGuard } from "../middlewares/csrf.js";
import { clearNotifications, listNotifications, markNotificationRead } from "../services/notification.service.js";

export const notificationRouter = Router();

notificationRouter.get("/me", requireAuth, asyncHandler(async (req, res) => {
  const notifications = await listNotifications(req.user!.id);
  res.json({ success: true, notifications });
}));

notificationRouter.patch("/:notificationId/read", requireAuth, csrfGuard, asyncHandler(async (req, res) => {
  const notification = await markNotificationRead(req.user!.id, req.params.notificationId);
  res.json({ success: true, notification });
}));

notificationRouter.delete("/me", requireAuth, csrfGuard, asyncHandler(async (req, res) => {
  const result = await clearNotifications(req.user!.id);
  res.json({ success: true, result });
}));
