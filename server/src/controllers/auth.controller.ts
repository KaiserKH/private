import type { RequestHandler } from "express";
import crypto from "crypto";
import { env } from "../config/env.js";
import { createCsrfToken } from "../utils/csrf.js";
import { authCookieOptions, csrfCookieOptions } from "../utils/cookies.js";
import { registerUser, loginUser, refreshUserSession, revokeSession, revokeUserSessions } from "../services/auth.service.js";
import { prisma } from "../config/prisma.js";
import { hashSecret } from "../utils/hash.js";

const sanitizeUser = (user: { passwordHash: string } & Record<string, unknown>) => {
  const { passwordHash, ...safeUser } = user;
  return safeUser;
};

export const issueCsrfToken: RequestHandler = (_req, res) => {
  const token = createCsrfToken(env.CSRF_SECRET);
  res.cookie("csrfToken", token, csrfCookieOptions);
  res.json({ success: true, csrfToken: token });
};

export const register: RequestHandler = async (req, res, next) => {
  try {
    const result = await registerUser({
      username: req.body.username,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      password: req.body.password,
      deviceId: req.body.deviceId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent") ?? undefined
    });

    res.cookie("accessToken", result.accessToken, authCookieOptions);
    res.cookie("refreshToken", result.refreshToken, authCookieOptions);
    res.cookie("csrfToken", createCsrfToken(env.CSRF_SECRET), csrfCookieOptions);
    res.status(201).json({ success: true, user: sanitizeUser(result.user) });
  } catch (error) {
    next(error);
  }
};

export const login: RequestHandler = async (req, res, next) => {
  try {
    const result = await loginUser({
      identifier: req.body.identifier,
      password: req.body.password,
      deviceId: req.body.deviceId,
      ipAddress: req.ip,
      userAgent: req.get("user-agent") ?? undefined
    });

    res.cookie("accessToken", result.accessToken, authCookieOptions);
    res.cookie("refreshToken", result.refreshToken, authCookieOptions);
    res.cookie("csrfToken", createCsrfToken(env.CSRF_SECRET), csrfCookieOptions);
    res.json({ success: true, user: sanitizeUser(result.user) });
  } catch (error) {
    next(error);
  }
};

export const refresh: RequestHandler = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) return res.status(401).json({ success: false, message: "Missing refresh token" });

    const result = await refreshUserSession(token);
    res.cookie("accessToken", result.accessToken, authCookieOptions);
    res.cookie("refreshToken", result.refreshToken, authCookieOptions);
    res.cookie("csrfToken", createCsrfToken(env.CSRF_SECRET), csrfCookieOptions);
    res.json({ success: true, user: sanitizeUser(result.user) });
  } catch (error) {
    next(error);
  }
};

export const logout: RequestHandler = async (req, res, next) => {
  try {
    if (req.session?.id) {
      await revokeSession(req.session.id);
    }

    res.clearCookie("accessToken", authCookieOptions);
    res.clearCookie("refreshToken", authCookieOptions);
    res.clearCookie("csrfToken", csrfCookieOptions);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const me: RequestHandler = async (req, res) => {
  if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      setting: true,
      sessions: { orderBy: { lastActiveAt: "desc" } },
      devices: true
    }
  });

  if (!user) return res.status(404).json({ success: false, message: "User not found" });

  const roles = await prisma.userRole.findMany({ where: { userId: user.id }, include: { role: true } });
  const permissions = await prisma.rolePermission.findMany({ where: { roleId: { in: roles.map((item) => item.roleId) } }, include: { permission: true } });

  res.json({
    success: true,
    user: {
      ...sanitizeUser(user),
      roles: roles.map((item) => item.role.name),
      permissions: permissions.map((item) => item.permission.key)
    }
  });
};

export const sessions: RequestHandler = async (req, res) => {
  const records = await prisma.session.findMany({ where: { userId: req.user!.id }, orderBy: { lastActiveAt: "desc" } });
  res.json({ success: true, sessions: records });
};

export const revokeOtherSessions: RequestHandler = async (req, res, next) => {
  try {
    await revokeUserSessions(req.user!.id, req.session?.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};
