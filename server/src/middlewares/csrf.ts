import type { RequestHandler } from "express";
import { env } from "../config/env.js";
import { verifyCsrfToken } from "../utils/csrf.js";

const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export const csrfGuard: RequestHandler = (req, res, next) => {
  if (!unsafeMethods.has(req.method)) return next();
  const cookieToken = req.cookies?.csrfToken as string | undefined;
  const headerToken = req.header("x-csrf-token");
  const token = headerToken ?? cookieToken;

  if (!verifyCsrfToken(env.CSRF_SECRET, token)) {
    return res.status(403).json({ success: false, message: "Invalid CSRF token" });
  }

  req.csrfToken = token;
  return next();
};
