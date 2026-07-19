import "server-only";

import { createHash } from "node:crypto";

import { supabaseAdmin } from "./supabaseAdmin";

export type StoredProjectState = {
  setup: {
    projectId: string;
    projectNumber: string;
    projectPassword: string;
    groupNumber: string;
    courseName: string;
    professorName: string;
    professorEmail: string;
    policyIssue: string;
    students: Array<{ name: string; email: string }>;
    teamLead: string;
  };
  objects: Array<{
    id: string;
    title: string;
    type: string;
    content: string;
    studioId: string;
  }>;
  studioStates?: Record<string, unknown>;
  notes: Array<{
    id: string;
    content: string;
    createdAt: string;
    createdBy: string;
  }>;
  alerts: Array<{
    id: string;
    studioId: string;
    studioName: string;
    message: string;
    note?: string;
    createdAt: string;
  }>;
  updatedAt: string | null;
};

export type ProjectSummary = {
  projectNumber: string;
  groupNumber: string;
  courseName: string;
  professorName: string;
  updatedAt: string;
  alertCount: number;
};

function normalizeProjectNumber(value: string) {
  return value.trim().toUpperCase();
}

export function hashProjectPassword(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function cleanString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function normalizeProjectState(value: unknown): StoredProjectState | null {
  if (!value || typeof value !== "object") return null;

  const project = value as Partial<StoredProjectState>;
  const setup = project.setup;
  if (!setup || typeof setup !== "object") return null;

  const projectNumber = cleanString(setup.projectNumber).trim();
  if (!projectNumber) return null;

  return {
    setup: {
      projectId: cleanString(setup.projectId),
      projectNumber,
      projectPassword: cleanString(setup.projectPassword),
      groupNumber: cleanString(setup.groupNumber),
      courseName: cleanString(setup.courseName),
      professorName: cleanString(setup.professorName),
      professorEmail: cleanString(setup.professorEmail),
      policyIssue: cleanString(setup.policyIssue),
      students: Array.isArray(setup.students)
        ? setup.students.slice(0, 5).map((student) => ({
            name: cleanString(student?.name),
            email: cleanString(student?.email),
          }))
        : [],
      teamLead: cleanString(setup.teamLead),
    },
    objects: Array.isArray(project.objects) ? project.objects : [],
    studioStates:
      project.studioStates && typeof project.studioStates === "object"
        ? project.studioStates
        : {},
    notes: Array.isArray(project.notes) ? project.notes : [],
    alerts: Array.isArray(project.alerts) ? project.alerts : [],
    updatedAt: cleanString(project.updatedAt, new Date().toISOString()),
  };
}

function toSummary(row: {
  project_number: string;
  group_number: string | null;
  course_name: string | null;
  professor_name: string | null;
  updated_at: string | null;
  project_state: StoredProjectState;
}): ProjectSummary {
  return {
    projectNumber: row.project_number,
    groupNumber: row.group_number || "",
    courseName: row.course_name || "",
    professorName: row.professor_name || "",
    updatedAt: row.updated_at || new Date().toISOString(),
    alertCount: Array.isArray(row.project_state?.alerts)
      ? row.project_state.alerts.length
      : 0,
  };
}

export async function saveProjectToSupabase(projectInput: unknown) {
  if (!supabaseAdmin) {
    throw new Error("Supabase is not configured.");
  }

  const project = normalizeProjectState(projectInput);
  if (!project) {
    throw new Error("Invalid project state.");
  }

  const projectNumber = normalizeProjectNumber(project.setup.projectNumber);
  const updatedAt = new Date().toISOString();
  const projectState: StoredProjectState = {
    ...project,
    setup: {
      ...project.setup,
      projectNumber,
    },
    updatedAt,
  };

  const { data, error } = await supabaseAdmin
    .from("team_projects")
    .upsert(
      {
        project_number: projectNumber,
        password_hash: hashProjectPassword(project.setup.projectPassword || ""),
        project_id: project.setup.projectId,
        group_number: project.setup.groupNumber,
        course_name: project.setup.courseName,
        professor_name: project.setup.professorName,
        project_state: projectState,
        updated_at: updatedAt,
      },
      { onConflict: "project_number" }
    )
    .select("project_state")
    .single();

  if (error) {
    throw error;
  }

  return data.project_state as StoredProjectState;
}

export async function listProjectsFromSupabase() {
  if (!supabaseAdmin) {
    throw new Error("Supabase is not configured.");
  }

  const { data, error } = await supabaseAdmin
    .from("team_projects")
    .select(
      "project_number, group_number, course_name, professor_name, updated_at, project_state"
    )
    .order("updated_at", { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []).map(toSummary);
}

export async function loadProjectFromSupabase(projectNumber: string) {
  if (!supabaseAdmin) {
    throw new Error("Supabase is not configured.");
  }

  const normalized = normalizeProjectNumber(projectNumber);
  if (!normalized) return null;

  const { data, error } = await supabaseAdmin
    .from("team_projects")
    .select("project_state")
    .eq("project_number", normalized)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data.project_state as StoredProjectState;
}

export async function loadProjectWithPasswordFromSupabase(
  projectNumber: string,
  projectPassword: string
) {
  if (!supabaseAdmin) {
    throw new Error("Supabase is not configured.");
  }

  const normalized = normalizeProjectNumber(projectNumber);
  if (!normalized) return null;

  const { data, error } = await supabaseAdmin
    .from("team_projects")
    .select("password_hash, project_state")
    .eq("project_number", normalized)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  if (data.password_hash !== hashProjectPassword(projectPassword)) {
    return null;
  }

  return data.project_state as StoredProjectState;
}

export async function deleteProjectFromSupabase(projectNumber: string) {
  if (!supabaseAdmin) {
    throw new Error("Supabase is not configured.");
  }

  const normalized = normalizeProjectNumber(projectNumber);
  if (!normalized) return false;

  const { error } = await supabaseAdmin
    .from("team_projects")
    .delete()
    .eq("project_number", normalized);

  if (error) {
    throw error;
  }

  return true;
}
