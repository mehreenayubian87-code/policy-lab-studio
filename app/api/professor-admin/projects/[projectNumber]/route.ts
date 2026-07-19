import { NextResponse } from "next/server";

import { hasValidAdminSession } from "@/app/team-setup/lib/adminAuth";
import {
  deleteProjectFromSupabase,
  loadProjectFromSupabase,
} from "@/app/team-setup/lib/projectStore";

export async function GET(
  _request: Request,
  context: { params: Promise<{ projectNumber: string }> }
) {
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

    const { projectNumber } = await context.params;
    const project = await loadProjectFromSupabase(projectNumber);

    if (!project) {
      return NextResponse.json(
        {
          ok: false,
          error: "Project not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, project });
  } catch (error) {
    console.error("Admin project load failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "The project could not be loaded.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ projectNumber: string }> }
) {
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

    const { projectNumber } = await context.params;
    await deleteProjectFromSupabase(projectNumber);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Admin project delete failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "The project could not be deleted.",
      },
      { status: 500 }
    );
  }
}
