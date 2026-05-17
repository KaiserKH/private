import crypto from "crypto";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";
import { compareSecret, hashSecret } from "../utils/hash.js";
import { signAccessToken, signRefreshToken, type TokenPayload, verifyRefreshToken } from "../utils/token.js";

const refreshTokenExpiryDays = 30;

const buildPayload = (user: { id: string; username: string; roles: string[]; permissions: string[]; isAdmin: boolean }, sessionId: string): TokenPayload => ({
  sub: user.id,
  username: user.username,
  sessionId,
  roles: user.roles,
  permissions: user.permissions,
  isAdmin: user.isAdmin
});

export const registerUser = async (input: {
  username: string;
  email?: string | null;
  phoneNumber?: string | null;
  password: string;
  deviceId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ username: input.username }, input.email ? { email: input.email } : undefined, input.phoneNumber ? { phoneNumber: input.phoneNumber } : undefined].filter(Boolean) as Array<Record<string, unknown>>
    }
  });

  if (existingUser) {
    throw Object.assign(new Error("Account already exists"), { statusCode: 409 });
  }

  const passwordHash = await hashSecret(input.password);
  const user = await prisma.user.create({
    data: {
      username: input.username,
      email: input.email ?? null,
      phoneNumber: input.phoneNumber ?? null,
      passwordHash,
      setting: { create: {} }
    }
  });

  const role = await prisma.role.upsert({
    where: { name: "NORMAL_USER" },
    create: { name: "NORMAL_USER" },
    update: {}
  });

  await prisma.userRole.create({ data: { userId: user.id, roleId: role.id } });

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash: "",
      status: "ACTIVE",
      deviceId: input.deviceId ?? crypto.randomUUID(),
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      deviceLabel: input.userAgent?.slice(0, 80) ?? "Unknown device",
      expiresAt: new Date(Date.now() + refreshTokenExpiryDays * 24 * 60 * 60 * 1000)
    }
  });

  const accessUser = {
    id: user.id,
    username: user.username,
    roles: [role.name],
    permissions: [],
    isAdmin: false
  };
  const payload = buildPayload(accessUser, session.id);
  const refreshToken = signRefreshToken(payload);
  const accessToken = signAccessToken(payload);

  await prisma.session.update({ where: { id: session.id }, data: { refreshTokenHash: await hashSecret(refreshToken) } });

  return { user, session, accessToken, refreshToken };
};

export const loginUser = async (input: { identifier: string; password: string; deviceId?: string | null; ipAddress?: string | null; userAgent?: string | null }) => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ username: input.identifier }, { email: input.identifier }, { phoneNumber: input.identifier }]
    }
  });

  if (!user) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });
  if (user.isBanned || user.isSuspended) throw Object.assign(new Error("Account disabled"), { statusCode: 403 });

  const validPassword = await compareSecret(input.password, user.passwordHash);
  if (!validPassword) throw Object.assign(new Error("Invalid credentials"), { statusCode: 401 });

  const roles = await prisma.userRole.findMany({ where: { userId: user.id }, include: { role: true } });
  const roleNames = roles.map((item) => item.role.name);
  const permissions = await prisma.rolePermission.findMany({ where: { roleId: { in: roles.map((item) => item.roleId) } }, include: { permission: true } });
  const accessUser = {
    id: user.id,
    username: user.username,
    roles: roleNames,
    permissions: permissions.map((item) => item.permission.key),
    isAdmin: roleNames.some((role) => ["SUPER_ADMIN", "ADMIN", "MODERATOR"].includes(role))
  };

  const session = await prisma.session.create({
    data: {
      userId: user.id,
      refreshTokenHash: "",
      status: "ACTIVE",
      deviceId: input.deviceId ?? crypto.randomUUID(),
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      deviceLabel: input.userAgent?.slice(0, 80) ?? "Unknown device",
      expiresAt: new Date(Date.now() + refreshTokenExpiryDays * 24 * 60 * 60 * 1000)
    }
  });

  const payload = buildPayload(accessUser, session.id);
  const refreshToken = signRefreshToken(payload);
  const accessToken = signAccessToken(payload);

  await prisma.session.update({ where: { id: session.id }, data: { refreshTokenHash: await hashSecret(refreshToken) } });
  await prisma.userDevice.upsert({
    where: { userId_deviceId: { userId: user.id, deviceId: session.deviceId ?? "default" } },
    create: { userId: user.id, deviceId: session.deviceId ?? "default", label: session.deviceLabel, ipAddress: input.ipAddress, userAgent: input.userAgent },
    update: { lastSeenAt: new Date(), label: session.deviceLabel, ipAddress: input.ipAddress, userAgent: input.userAgent }
  });

  return { user, session, accessToken, refreshToken };
};

export const refreshUserSession = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);
  const session = await prisma.session.findUnique({ where: { id: payload.sessionId }, include: { user: true } });
  if (!session || session.status !== "ACTIVE") throw Object.assign(new Error("Session revoked"), { statusCode: 401 });

  const storedRefreshHash = session.refreshTokenHash;
  const tokenMatches = await compareSecret(refreshToken, storedRefreshHash);
  if (!tokenMatches) throw Object.assign(new Error("Session rotated"), { statusCode: 401 });

  const roles = await prisma.userRole.findMany({ where: { userId: session.userId }, include: { role: true } });
  const roleNames = roles.map((item) => item.role.name);
  const permissions = await prisma.rolePermission.findMany({ where: { roleId: { in: roles.map((item) => item.roleId) } }, include: { permission: true } });
  const accessUser = {
    id: session.user.id,
    username: session.user.username,
    roles: roleNames,
    permissions: permissions.map((item) => item.permission.key),
    isAdmin: roleNames.some((role) => ["SUPER_ADMIN", "ADMIN", "MODERATOR"].includes(role))
  };

  const refreshedPayload = buildPayload(accessUser, session.id);
  const newAccessToken = signAccessToken(refreshedPayload);
  const newRefreshToken = signRefreshToken(refreshedPayload);
  await prisma.session.update({ where: { id: session.id }, data: { refreshTokenHash: await hashSecret(newRefreshToken), lastActiveAt: new Date() } });

  return { user: session.user, accessToken: newAccessToken, refreshToken: newRefreshToken };
};

export const revokeSession = async (sessionId: string) => {
  return prisma.session.update({ where: { id: sessionId }, data: { status: "REVOKED" } });
};

export const revokeUserSessions = async (userId: string, exceptSessionId?: string) => {
  return prisma.session.updateMany({
    where: { userId, ...(exceptSessionId ? { id: { not: exceptSessionId } } : {}) },
    data: { status: "REVOKED" }
  });
};
