import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middlewares/auth.js";
import { csrfGuard } from "../middlewares/csrf.js";
import { deleteUserAdminLog, listUserAdminLogs } from "../services/audit.service.js";

export const auditRouter = Router();

auditRouter.get("/me", requireAuth, asyncHandler(async (req, res) => {
  const logs = await listUserAdminLogs(req.user!.id);
  res.json({ success: true, logs });
}));

auditRouter.delete("/:logId", requireAuth, csrfGuard, asyncHandler(async (req, res) => {
  const log = await deleteUserAdminLog(req.user!.id, req.params.logId);
  res.json({ success: true, log });
}));
