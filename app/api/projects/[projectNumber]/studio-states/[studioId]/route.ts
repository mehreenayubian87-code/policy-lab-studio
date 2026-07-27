import { NextResponse } from "next/server";

import {
  loadProjectWithPasswordFromSupabase,
  saveStudioStateToSupabase,
} from "@/app/team-setup/lib/projectStore";

type RouteContext = {
  params: Promise<{
    projectNumber: string;
    studioId: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  try {
    const { projectNumber, studioId } = await context.params;
    const body = (await request.json()) as {
      password?: string;
      state?: unknown;
    };
    const password = typeof body.password === "string" ? body.password : "";

    const project = await saveStudioStateToSupabase(
      projectNumber,
      password,
      studioId,
      body.state
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
    console.error("Studio state save failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "The studio state could not be saved.",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request, context: RouteContext) {
  try {
    const { projectNumber, studioId } = await context.params;
    const { searchParams } = new URL(request.url);
    const password = searchParams.get("password") || "";

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

    return NextResponse.json({
      ok: true,
      state: project.studioStates?.[studioId] ?? null,
      updatedAt: project.updatedAt,
    });
  } catch (error) {
    console.error("Studio state load failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "The studio state could not be loaded.",
      },
      { status: 500 }
    );
  }
}
