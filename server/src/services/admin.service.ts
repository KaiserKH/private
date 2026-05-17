import { prisma } from "../config/prisma.js";
import { createAdminLog } from "./audit.service.js";
import { revokeUserSessions } from "./auth.service.js";

export const getAdminDashboard = async () => {
  const [users, messages, sessions, logs, bans] = await Promise.all([
    prisma.user.count(),
    prisma.message.count(),
    prisma.session.count({ where: { status: "ACTIVE" } }),
    prisma.adminActivityLog.count(),
    prisma.user.count({ where: { OR: [{ isSuspended: true }, { isBanned: true }] } })
  ]);

  return { users, messages, sessions, logs, bans };
};

export const getAdminLogsForUser = async (userId: string) => {
  return prisma.adminActivityLog.findMany({ where: { targetUserId: userId }, orderBy: { createdAt: "desc" } });
};

export const suspendUser = async (actorId: string, targetUserId: string, suspended = true, reason?: string) => {
  const user = await prisma.user.update({ where: { id: targetUserId }, data: { isSuspended: suspended } });
  await createAdminLog({ actorId, targetUserId, action: suspended ? "suspend_user" : "unsuspend_user", category: "moderation", details: { reason } });
  return user;
};

export const banUser = async (actorId: string, targetUserId: string, banned = true, reason?: string) => {
  const user = await prisma.user.update({ where: { id: targetUserId }, data: { isBanned: banned } });
  await createAdminLog({ actorId, targetUserId, action: banned ? "ban_user" : "unban_user", category: "moderation", details: { reason } });
  return user;
};

export const resetPasswordForUser = async (actorId: string, targetUserId: string, passwordHash: string) => {
  const user = await prisma.user.update({ where: { id: targetUserId }, data: { passwordHash } });
  await revokeUserSessions(targetUserId);
  await createAdminLog({ actorId, targetUserId, action: "reset_password", category: "account", details: {} });
  return user;
};

export const upsertFeatureToggle = async (actorId: string, input: {
  featureKey: string;
  scope?: string;
  roleId?: string | null;
  userId?: string | null;
  enabled: boolean;
  metadata?: Record<string, unknown>;
}) => {
  const existing = await prisma.featureToggle.findFirst({
    where: {
      featureKey: input.featureKey,
      scope: input.scope ?? "global",
      ...(input.userId ? { userId: input.userId } : {}),
      ...(input.roleId ? { roleId: input.roleId } : {})
    }
  });

  const record = existing
    ? await prisma.featureToggle.update({ where: { id: existing.id }, data: { enabled: input.enabled, metadata: input.metadata } })
    : await prisma.featureToggle.create({ data: { featureKey: input.featureKey, scope: input.scope ?? "global", roleId: input.roleId ?? null, userId: input.userId ?? null, enabled: input.enabled, metadata: input.metadata } });

  await createAdminLog({ actorId, targetUserId: input.userId ?? null, action: "feature_toggle_change", category: "permissions", details: input as Record<string, unknown> });
  return record;
};
