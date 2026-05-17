import { env } from "../config/env.js";
const secure = env.NODE_ENV === "production";
export const authCookieOptions = {
    httpOnly: true,
    secure,
    sameSite: secure ? "none" : "lax",
    path: "/"
};
export const csrfCookieOptions = {
    httpOnly: false,
    secure,
    sameSite: secure ? "none" : "lax",
    path: "/"
};
