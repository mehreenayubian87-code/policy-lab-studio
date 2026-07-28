import { NextResponse } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  hasValidAdminSession,
  isAdminConfigured,
  validateAdminCredentials,
} from "@/app/team-setup/lib/adminAuth";

type AdminLoginBody = {
  username?: string;
  password?: string;
};

export async function GET() {
  return NextResponse.json({ isAdmin: await hasValidAdminSession() });
}

export async function POST(request: Request) {
  if (!isAdminConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error: "Admin login is not configured.",
      },
      { status: 500 }
    );
  }

  try {
    const body = (await request.json()) as AdminLoginBody;
    const username = typeof body.username === "string" ? body.username.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (validateAdminCredentials(username, password)) {
      const response = NextResponse.json({ ok: true });
      response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      {
        ok: false,
        error: "Invalid admin credentials.",
      },
      { status: 401 }
    );
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Invalid request.",
      },
      { status: 400 }
    );
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(ADMIN_SESSION_COOKIE);

  return response;
}
