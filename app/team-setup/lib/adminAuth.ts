import "server-only";

import { createHash } from "node:crypto";

import { cookies } from "next/headers";

import { loadLocalEnvFiles } from "./loadEnvFromFiles";

export const ADMIN_SESSION_COOKIE = "policy_lab_admin_session";

loadLocalEnvFiles();

function expectedUsername() {
  return process.env.PROFESSOR_ADMIN_USERNAME || "";
}

function expectedPassword() {
  return process.env.PROFESSOR_ADMIN_PASSWORD || "";
}

export function isAdminConfigured() {
  return Boolean(expectedUsername() && expectedPassword());
}

export function validateAdminCredentials(username: string, password: string) {
  return (
    isAdminConfigured() &&
    username.trim() === expectedUsername() &&
    password === expectedPassword()
  );
}

export function createAdminSessionToken() {
  return createHash("sha256")
    .update(`${expectedUsername()}:${expectedPassword()}`)
    .digest("hex");
}

export async function hasValidAdminSession() {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value === createAdminSessionToken();
}
