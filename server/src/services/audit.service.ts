import { prisma } from "../config/prisma.js";

export const createAdminLog = async (params: {
  actorId: string;
  targetUserId?: string | null;
  action: string;
  category: string;
  details?: Record<string, unknown>;
}) => {
  return prisma.adminActivityLog.create({
    data: {
      actorId: params.actorId,
      targetUserId: params.targetUserId ?? null,
      action: params.action,
      category: params.category,
      details: params.details ?? undefined
    }
  });
};

export const notifyUserAudit = async () => undefined;

export const listUserAdminLogs = async (userId: string) => {
  return prisma.adminActivityLog.findMany({
    where: { targetUserId: userId },
    orderBy: { createdAt: "desc" }
  });
};

export const deleteUserAdminLog = async (userId: string, logId: string) => {
  const record = await prisma.adminActivityLog.findUnique({ where: { id: logId } });
  if (!record || record.targetUserId !== userId) throw Object.assign(new Error("Log not found"), { statusCode: 404 });
  return prisma.adminActivityLog.delete({ where: { id: logId } });
};

