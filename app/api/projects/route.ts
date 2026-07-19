import { NextResponse } from "next/server";

import { saveProjectToSupabase } from "@/app/team-setup/lib/projectStore";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const body = rawBody ? JSON.parse(rawBody) : {};
    const project = await saveProjectToSupabase(body.project);

    return NextResponse.json({ ok: true, project });
  } catch (error) {
    console.error("Project save failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "The project could not be saved.",
      },
      { status: 500 }
    );
  }
}
