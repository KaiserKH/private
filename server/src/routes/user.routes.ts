import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import { getProfile, searchUsers, updateProfile } from "../services/user.service.js";

export const userRouter = Router();

userRouter.get("/search", requireAuth, asyncHandler(async (req, res) => {
  const result = await searchUsers(String(req.query.q ?? ""));
  res.json({ success: true, ...result });
}));

userRouter.get("/:userId", requireAuth, asyncHandler(async (req, res) => {
  const profile = await getProfile(req.params.userId);
  if (!profile) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, user: profile });
}));

userRouter.patch(
  "/me",
  requireAuth,
  validate({ body: z.object({ displayName: z.string().optional(), bio: z.string().optional(), profilePhotoUrl: z.string().url().optional(), wallpaperUrl: z.string().url().optional() }) }),
  asyncHandler(async (req, res) => {
    const updated = await updateProfile(req.user!.id, req.body);
    res.json({ success: true, user: updated });
  })
);
