import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middlewares/auth.js";
import { listFeatureState } from "../services/permission.service.js";

export const permissionRouter = Router();

permissionRouter.get("/me", requireAuth, asyncHandler(async (req, res) => {
  const features = await listFeatureState(req.user!.id);
  res.json({ success: true, features });
}));
