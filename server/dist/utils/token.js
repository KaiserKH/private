import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
const accessOptions = { expiresIn: env.JWT_ACCESS_EXPIRES_IN };
const refreshOptions = { expiresIn: env.JWT_REFRESH_EXPIRES_IN };
export const signAccessToken = (payload) => jwt.sign(payload, env.JWT_ACCESS_SECRET, accessOptions);
export const signRefreshToken = (payload) => jwt.sign(payload, env.JWT_REFRESH_SECRET, refreshOptions);
export const verifyAccessToken = (token) => jwt.verify(token, env.JWT_ACCESS_SECRET);
export const verifyRefreshToken = (token) => jwt.verify(token, env.JWT_REFRESH_SECRET);
