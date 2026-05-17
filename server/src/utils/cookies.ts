import type { CookieOptions } from "express";
import { env } from "../config/env.js";

const secure = env.NODE_ENV === "production";

export const authCookieOptions: CookieOptions = {
  httpOnly: true,
  secure,
  sameSite: secure ? "none" : "lax",
  path: "/"
};

export const csrfCookieOptions: CookieOptions = {
  httpOnly: false,
  secure,
  sameSite: secure ? "none" : "lax",
  path: "/"
};
