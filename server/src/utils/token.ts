import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export type TokenPayload = {
  sub: string;
  username: string;
  sessionId: string;
  roles: string[];
  permissions: string[];
  isAdmin: boolean;
};

const accessOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN } as const;
const refreshOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as const;

export const signAccessToken = (payload: TokenPayload) => jwt.sign(payload, env.JWT_ACCESS_SECRET, accessOptions);
export const signRefreshToken = (payload: TokenPayload) => jwt.sign(payload, env.JWT_REFRESH_SECRET, refreshOptions);
export const verifyAccessToken = (token: string) => jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
export const verifyRefreshToken = (token: string) => jwt.verify(token, env.JWT_REFRESH_SECRET) as TokenPayload;
