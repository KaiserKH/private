import crypto from "crypto";

export const createCsrfToken = (secret: string) => {
  const nonce = crypto.randomBytes(32).toString("hex");
  const hmac = crypto.createHmac("sha256", secret).update(nonce).digest("hex");
  return `${nonce}.${hmac}`;
};

export const verifyCsrfToken = (secret: string, token?: string | null) => {
  if (!token) return false;
  const [nonce, hmac] = token.split(".");
  if (!nonce || !hmac) return false;
  const expected = crypto.createHmac("sha256", secret).update(nonce).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(hmac);
  if (expectedBuffer.length !== providedBuffer.length) return false;
  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
};
