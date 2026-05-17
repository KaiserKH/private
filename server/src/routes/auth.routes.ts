import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { csrfGuard } from "../middlewares/csrf.js";
import { requireAuth } from "../middlewares/auth.js";
import { login, logout, me, refresh, register, revokeOtherSessions, sessions, issueCsrfToken } from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.get("/csrf", asyncHandler(issueCsrfToken));
authRouter.post("/register", csrfGuard, asyncHandler(register));
authRouter.post("/login", csrfGuard, asyncHandler(login));
authRouter.post("/refresh", asyncHandler(refresh));
authRouter.post("/logout", requireAuth, csrfGuard, asyncHandler(logout));
authRouter.get("/me", requireAuth, asyncHandler(me));
authRouter.get("/sessions", requireAuth, asyncHandler(sessions));
authRouter.post("/sessions/revoke-others", requireAuth, csrfGuard, asyncHandler(revokeOtherSessions));
