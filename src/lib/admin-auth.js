import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "mau-admin-session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function getSessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("ADMIN_SESSION_SECRET must contain at least 32 characters.");
  }
  return secret;
}

function sign(payload) {
  return createHmac("sha256", getSessionSecret()).update(payload).digest("base64url");
}

export function verifyAdminPassword(password) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (!configuredPassword) throw new Error("ADMIN_PASSWORD is not configured.");

  const candidate = Buffer.from(password);
  const expected = Buffer.from(configuredPassword);
  return candidate.length === expected.length && timingSafeEqual(candidate, expected);
}

export function createAdminSession() {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const payload = Buffer.from(JSON.stringify({ expiresAt })).toString("base64url");
  return { token: `${payload}.${sign(payload)}`, maxAge: SESSION_DURATION_SECONDS };
}

export async function isAdminAuthenticated() {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return false;

  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;

  const expected = Buffer.from(sign(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return Number.isInteger(data.expiresAt) && data.expiresAt > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function adminCookieName() {
  return COOKIE_NAME;
}
