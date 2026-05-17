import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middlewares/auth.js";
import { csrfGuard } from "../middlewares/csrf.js";
import { getSettings, updateSettings } from "../services/settings.service.js";

export const settingsRouter = Router();

settingsRouter.get("/me", requireAuth, asyncHandler(async (req, res) => {
  const settings = await getSettings(req.user!.id);
  res.json({ success: true, settings });
}));

settingsRouter.patch("/me", requireAuth, csrfGuard, asyncHandler(async (req, res) => {
  const settings = await updateSettings(req.user!.id, req.body ?? {});
  res.json({ success: true, settings });
}));
