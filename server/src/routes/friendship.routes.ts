import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middlewares/auth.js";
import { csrfGuard } from "../middlewares/csrf.js";
import { validate } from "../middlewares/validate.js";
import { blockUser, cancelFriendRequest, favoriteFriend, muteFriend, removeFriend, respondToFriendRequest, sendFriendRequest, unblockUser } from "../services/friendship.service.js";

export const friendshipRouter = Router();

friendshipRouter.post(
  "/requests",
  requireAuth,
  csrfGuard,
  validate({ body: z.object({ receiverId: z.string(), message: z.string().optional() }) }),
  asyncHandler(async (req, res) => {
    const record = await sendFriendRequest(req.user!.id, req.body.receiverId, req.body.message);
    res.status(201).json({ success: true, request: record });
  })
);

friendshipRouter.post(
  "/requests/:requestId/respond",
  requireAuth,
  csrfGuard,
  validate({ body: z.object({ action: z.enum(["ACCEPTED", "REJECTED"]) }) }),
  asyncHandler(async (req, res) => {
    const record = await respondToFriendRequest(req.params.requestId, req.user!.id, req.body.action);
    res.json({ success: true, request: record });
  })
);

friendshipRouter.post("/requests/:requestId/cancel", requireAuth, csrfGuard, asyncHandler(async (req, res) => {
  const record = await cancelFriendRequest(req.params.requestId, req.user!.id);
  res.json({ success: true, request: record });
}));

friendshipRouter.delete("/:targetUserId", requireAuth, csrfGuard, asyncHandler(async (req, res) => {
  await removeFriend(req.user!.id, req.params.targetUserId);
  res.json({ success: true });
}));

friendshipRouter.post("/:targetUserId/block", requireAuth, csrfGuard, asyncHandler(async (req, res) => {
  const record = await blockUser(req.user!.id, req.params.targetUserId);
  res.status(201).json({ success: true, block: record });
}));

friendshipRouter.post("/:targetUserId/unblock", requireAuth, csrfGuard, asyncHandler(async (req, res) => {
  const record = await unblockUser(req.user!.id, req.params.targetUserId);
  res.json({ success: true, block: record });
}));

friendshipRouter.post("/:targetUserId/mute", requireAuth, csrfGuard, validate({ body: z.object({ mutedUntil: z.string().datetime().nullable().optional() }) }), asyncHandler(async (req, res) => {
  const mutedUntil = req.body.mutedUntil ? new Date(req.body.mutedUntil) : null;
  const record = await muteFriend(req.user!.id, req.params.targetUserId, mutedUntil);
  res.json({ success: true, friendship: record });
}));

friendshipRouter.post("/:targetUserId/favorite", requireAuth, csrfGuard, validate({ body: z.object({ favorite: z.boolean().default(true) }) }), asyncHandler(async (req, res) => {
  const record = await favoriteFriend(req.user!.id, req.params.targetUserId, req.body.favorite);
  res.json({ success: true, friendship: record });
}));
