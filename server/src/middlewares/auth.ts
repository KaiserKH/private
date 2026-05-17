import type { RequestHandler } from "express";
import { prisma } from "../config/prisma.js";
import { verifyAccessToken } from "../utils/token.js";

const readToken = (authorization?: string, cookieToken?: string) => {
  if (cookieToken) return cookieToken;
  if (authorization?.startsWith("Bearer ")) return authorization.slice(7);
  return null;
};

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const token = readToken(req.header("authorization"), req.cookies?.accessToken);
    if (!token) return res.status(401).json({ success: false, message: "Unauthorized" });

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { sessions: true }
    });
    const session = await prisma.session.findUnique({ where: { id: payload.sessionId } });

    if (!user || !session || session.status !== "ACTIVE" || session.expiresAt < new Date() || user.isBanned || user.isSuspended) {
      return res.status(401).json({ success: false, message: "Account disabled" });
    }

    const roles = await prisma.userRole.findMany({
      where: { userId: user.id },
      include: { role: true }
    });

    const roleNames = roles.map((item) => item.role.name);
    const permissions = await prisma.rolePermission.findMany({
      where: { roleId: { in: roles.map((item) => item.roleId) } },
      include: { permission: true }
    });

    req.user = {
      id: user.id,
      username: user.username,
      roles: roleNames,
      permissions: permissions.map((item) => item.permission.key),
      isAdmin: roleNames.some((role) => ["SUPER_ADMIN", "ADMIN", "MODERATOR"].includes(role))
    };
    req.session = {
      id: payload.sessionId,
      status: session.status,
      deviceId: session.deviceId
    };

    next();
  } catch {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};
