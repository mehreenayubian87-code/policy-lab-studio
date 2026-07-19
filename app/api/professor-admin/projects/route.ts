import { NextResponse } from "next/server";

import { hasValidAdminSession } from "@/app/team-setup/lib/adminAuth";
import { listProjectsFromSupabase } from "@/app/team-setup/lib/projectStore";

export async function GET() {
  try {
    if (!(await hasValidAdminSession())) {
      return NextResponse.json(
        {
          ok: false,
          error: "Admin login is required.",
        },
        { status: 401 }
      );
    }

    const projects = await listProjectsFromSupabase();

    return NextResponse.json({ ok: true, projects });
  } catch (error) {
    console.error("Admin project list failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Registered projects could not be loaded.",
      },
      { status: 500 }
    );
  }
}
