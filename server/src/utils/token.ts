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

const accessOptions: jwt.SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN as unknown as jwt.SignOptions["expiresIn"] };
const refreshOptions: jwt.SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN as unknown as jwt.SignOptions["expiresIn"] };

export const signAccessToken = (payload: TokenPayload) => jwt.sign(payload, env.JWT_ACCESS_SECRET as jwt.Secret, accessOptions);
export const signRefreshToken = (payload: TokenPayload) => jwt.sign(payload, env.JWT_REFRESH_SECRET as jwt.Secret, refreshOptions);
export const verifyAccessToken = (token: string) => jwt.verify(token, env.JWT_ACCESS_SECRET as jwt.Secret) as TokenPayload;
export const verifyRefreshToken = (token: string) => jwt.verify(token, env.JWT_REFRESH_SECRET as jwt.Secret) as TokenPayload;
