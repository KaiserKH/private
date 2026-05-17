import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import { adminRouter, auditRouter, authRouter, callRouter, friendshipRouter, messageRouter, notificationRouter, permissionRouter, settingsRouter, uploadRouter, userRouter } from "./routes/index.js";
import { errorHandler } from "./middlewares/error.js";

export const createApp = () => {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300 }));
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser(env.COOKIE_SECRET));

  app.get("/health", (_req, res) => res.json({ success: true, status: "ok" }));
  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/friends", friendshipRouter);
  app.use("/api/messages", messageRouter);
  app.use("/api/settings", settingsRouter);
  app.use("/api/notifications", notificationRouter);
  app.use("/api/permissions", permissionRouter);
  app.use("/api/audit", auditRouter);
  app.use("/api/uploads", uploadRouter);
  app.use("/api/calls", callRouter);
  app.use("/api/admin", adminRouter);

  app.use(errorHandler);
  return app;
};
