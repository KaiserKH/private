import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middlewares/auth.js";
import { csrfGuard } from "../middlewares/csrf.js";
import { validate } from "../middlewares/validate.js";
import { listCallHistory, startCall, updateCallStatus } from "../services/call.service.js";

export const callRouter = Router();

callRouter.get("/history/me", requireAuth, asyncHandler(async (req, res) => {
  const history = await listCallHistory(req.user!.id);
  res.json({ success: true, history });
}));

callRouter.post("/start", requireAuth, csrfGuard, validate({ body: z.object({ calleeId: z.string(), type: z.enum(["VOICE", "VIDEO"]), signaling: z.record(z.any()).optional() }) }), asyncHandler(async (req, res) => {
  const call = await startCall({ callerId: req.user!.id, calleeId: req.body.calleeId, type: req.body.type, signaling: req.body.signaling });
  res.status(201).json({ success: true, call });
}));

callRouter.patch("/:callId/status", requireAuth, csrfGuard, validate({ body: z.object({ status: z.enum(["ACTIVE", "ENDED", "MISSED", "REJECTED"]) }) }), asyncHandler(async (req, res) => {
  const call = await updateCallStatus(req.params.callId, req.body.status);
  res.json({ success: true, call });
}));
