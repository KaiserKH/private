import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middlewares/auth.js";
import { csrfGuard } from "../middlewares/csrf.js";
import { requirePermission } from "../middlewares/permission.js";
import { validate } from "../middlewares/validate.js";
import { banUser, getAdminDashboard, getAdminLogsForUser, resetPasswordForUser, suspendUser, upsertFeatureToggle } from "../services/admin.service.js";
import { hashSecret } from "../utils/hash.js";

export const adminRouter = Router();

adminRouter.get("/dashboard", requireAuth, requirePermission("admin:dashboard"), asyncHandler(async (_req, res) => {
  const dashboard = await getAdminDashboard();
  res.json({ success: true, dashboard });
}));

adminRouter.get("/logs/:userId", requireAuth, requirePermission("admin:logs"), asyncHandler(async (req, res) => {
  const logs = await getAdminLogsForUser(req.params.userId);
  res.json({ success: true, logs });
}));

adminRouter.post("/users/:userId/suspend", requireAuth, requirePermission("admin:moderate"), csrfGuard, validate({ body: z.object({ suspended: z.boolean().default(true), reason: z.string().optional() }) }), asyncHandler(async (req, res) => {
  const user = await suspendUser(req.user!.id, req.params.userId, req.body.suspended, req.body.reason);
  res.json({ success: true, user });
}));

adminRouter.post("/users/:userId/ban", requireAuth, requirePermission("admin:moderate"), csrfGuard, validate({ body: z.object({ banned: z.boolean().default(true), reason: z.string().optional() }) }), asyncHandler(async (req, res) => {
  const user = await banUser(req.user!.id, req.params.userId, req.body.banned, req.body.reason);
  res.json({ success: true, user });
}));

adminRouter.post("/users/:userId/reset-password", requireAuth, requirePermission("admin:moderate"), csrfGuard, validate({ body: z.object({ password: z.string().min(8) }) }), asyncHandler(async (req, res) => {
  const passwordHash = await hashSecret(req.body.password);
  const user = await resetPasswordForUser(req.user!.id, req.params.userId, passwordHash);
  res.json({ success: true, user });
}));

adminRouter.post("/features", requireAuth, requirePermission("admin:permissions"), csrfGuard, validate({ body: z.object({ featureKey: z.string(), scope: z.string().optional(), roleId: z.string().nullable().optional(), userId: z.string().nullable().optional(), enabled: z.boolean(), metadata: z.record(z.any()).optional() }) }), asyncHandler(async (req, res) => {
  const feature = await upsertFeatureToggle(req.user!.id, req.body);
  res.status(201).json({ success: true, feature });
}));
