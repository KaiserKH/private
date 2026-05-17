import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middlewares/auth.js";
import { csrfGuard } from "../middlewares/csrf.js";
import { validate } from "../middlewares/validate.js";
import { deleteMessageForEveryone, deleteMessageForSelf, editMessage, getOrCreateDirectConversation, listConversations, listMessages, markConversationSeen, reactToMessage, sendMessage } from "../services/message.service.js";

export const messageRouter = Router();

messageRouter.get("/conversations", requireAuth, asyncHandler(async (req, res) => {
  const conversations = await listConversations(req.user!.id);
  res.json({ success: true, conversations });
}));

messageRouter.get("/conversations/:conversationId/messages", requireAuth, asyncHandler(async (req, res) => {
  const messages = await listMessages(req.params.conversationId, typeof req.query.cursor === "string" ? req.query.cursor : undefined);
  res.json({ success: true, messages });
}));

messageRouter.post(
  "/direct",
  requireAuth,
  csrfGuard,
  validate({ body: z.object({ targetUserId: z.string() }) }),
  asyncHandler(async (req, res) => {
    const conversation = await getOrCreateDirectConversation(req.user!.id, req.body.targetUserId, req.user!.isAdmin);
    res.json({ success: true, conversation });
  })
);

messageRouter.post(
  "/send",
  requireAuth,
  csrfGuard,
  validate({ body: z.object({ targetUserId: z.string(), content: z.string().min(1), type: z.enum(["TEXT", "IMAGE", "VIDEO", "FILE", "VOICE_NOTE", "SYSTEM"]).optional(), replyToId: z.string().optional() }) }),
  asyncHandler(async (req, res) => {
    const record = await sendMessage({ senderId: req.user!.id, targetUserId: req.body.targetUserId, content: req.body.content, type: req.body.type, replyToId: req.body.replyToId, actorIsAdmin: req.user!.isAdmin });
    res.status(201).json({ success: true, ...record });
  })
);

messageRouter.patch("/:messageId", requireAuth, csrfGuard, validate({ body: z.object({ content: z.string().min(1) }) }), asyncHandler(async (req, res) => {
  const record = await editMessage(req.params.messageId, req.user!.id, req.body.content, req.user!.isAdmin);
  res.json({ success: true, message: record });
}));

messageRouter.delete("/:messageId", requireAuth, csrfGuard, asyncHandler(async (req, res) => {
  const record = await deleteMessageForEveryone(req.params.messageId, req.user!.id, req.user!.isAdmin);
  res.json({ success: true, message: record });
}));

messageRouter.delete("/:messageId/self", requireAuth, csrfGuard, asyncHandler(async (req, res) => {
  const record = await deleteMessageForSelf(req.params.messageId, req.user!.id);
  res.json({ success: true, message: record });
}));

messageRouter.post("/:messageId/reactions", requireAuth, csrfGuard, validate({ body: z.object({ emoji: z.string().min(1) }) }), asyncHandler(async (req, res) => {
  const record = await reactToMessage(req.params.messageId, req.user!.id, req.body.emoji);
  res.status(201).json({ success: true, reaction: record });
}));

messageRouter.post("/conversations/:conversationId/seen", requireAuth, csrfGuard, asyncHandler(async (req, res) => {
  const record = await markConversationSeen(req.params.conversationId, req.user!.id);
  res.json({ success: true, participant: record });
}));
