import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const allowedStudios = new Set([
  "problem",
  "process",
  "solution",
  "implementation",
]);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubmitFeedbackBody = {
  projectKey?: string;
  studioId?: string;
  studioName?: string;
  groupNumber?: string;
  courseName?: string;
  policyIssue?: string;
  submittedByName?: string;
  submittedByEmail?: string;
  professorName?: string;
  professorEmail?: string;
  question?: string;
};

function clean(value: unknown, maxLength: number) {
  return typeof value === "string"
    ? value.trim().slice(0, maxLength)
    : "";
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SubmitFeedbackBody;

    const projectKey = clean(body.projectKey, 200);
    const studioId = clean(body.studioId, 50);
    const studioName = clean(body.studioName, 150);
    const groupNumber = clean(body.groupNumber, 100);
    const courseName = clean(body.courseName, 200);
    const policyIssue = clean(body.policyIssue, 500);
    const submittedByName = clean(body.submittedByName, 200);
    const submittedByEmail = clean(body.submittedByEmail, 320);
    const professorName = clean(body.professorName, 200);
    const professorEmail = clean(body.professorEmail, 320);
    const question = clean(body.question, 5000);

    if (
      !projectKey ||
      !studioId ||
      !studioName ||
      !groupNumber ||
      !courseName ||
      !policyIssue ||
      !submittedByName ||
      !submittedByEmail ||
      !professorName ||
      !professorEmail ||
      !question
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Complete all required feedback fields.",
        },
        { status: 400 }
      );
    }

    if (!allowedStudios.has(studioId)) {
      return NextResponse.json(
        {
          ok: false,
          error: "This studio is not available for professor feedback.",
        },
        { status: 400 }
      );
    }

    if (
      !emailPattern.test(submittedByEmail) ||
      !emailPattern.test(professorEmail)
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "One or more email addresses are invalid.",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("professor_feedback")
      .insert({
        project_key: projectKey,
        studio_id: studioId,
        studio_name: studioName,
        group_number: groupNumber,
        course_name: courseName,
        policy_issue: policyIssue,
        submitted_by_name: submittedByName,
        submitted_by_email: submittedByEmail,
        professor_name: professorName,
        professor_email: professorEmail,
        question,
        status: "Submitted",
      })
      .select(
        `
          id,
          review_token,
          project_key,
          studio_id,
          studio_name,
          submitted_by_name,
          question,
          status,
          submitted_at
        `
      )
      .single();

    if (error) {
      console.error("Professor feedback insert failed:", error);

      return NextResponse.json(
        {
          ok: false,
          error: "The feedback request could not be saved.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        feedback: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Professor feedback request failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: "Invalid request.",
      },
      { status: 400 }
    );
  }
}
