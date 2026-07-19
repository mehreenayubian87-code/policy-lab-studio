import { NextResponse } from "next/server";

import { loadProjectWithPasswordFromSupabase } from "@/app/team-setup/lib/projectStore";

export async function POST(
  request: Request,
  context: { params: Promise<{ projectNumber: string }> }
) {
  try {
    const { projectNumber } = await context.params;
    const body = (await request.json()) as { password?: string };
    const password = typeof body.password === "string" ? body.password : "";

    const project = await loadProjectWithPasswordFromSupabase(
      projectNumber,
      password
    );

    if (!project) {
      return NextResponse.json(
        {
          ok: false,
          error: "Project not found or password is incorrect.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, project });
  } catch (error) {
    console.error("Project load failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "The project could not be loaded.",
      },
      { status: 500 }
    );
  }
}
