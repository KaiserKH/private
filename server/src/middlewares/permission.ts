import type { RequestHandler } from "express";

export const requirePermission = (...permissions: string[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Unauthorized" });
    if (req.user.isAdmin) return next();
    const allowed = permissions.every((permission) => req.user?.permissions.includes(permission));
    if (!allowed) return res.status(403).json({ success: false, message: "Forbidden" });
    next();
  };
};
