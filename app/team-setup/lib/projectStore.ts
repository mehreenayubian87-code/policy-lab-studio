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

function projectNumberCandidates(value: string) {
  return Array.from(
    new Set([cleanString(value).trim(), normalizeProjectNumber(value)].filter(Boolean))
  );
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

function getStateSavedTime(value: unknown) {
  if (!value || typeof value !== "object") return 0;

  const savedAt = (value as { savedAt?: unknown }).savedAt;
  if (typeof savedAt !== "string") return 0;

  const time = Date.parse(savedAt);
  return Number.isFinite(time) ? time : 0;
}

function mergeStudioStates(
  existing: Record<string, unknown> | undefined,
  incoming: Record<string, unknown> | undefined
) {
  const merged: Record<string, unknown> = {
    ...(existing || {}),
  };

  for (const [studioId, incomingState] of Object.entries(incoming || {})) {
    const existingState = merged[studioId];
    const existingTime = getStateSavedTime(existingState);
    const incomingTime = getStateSavedTime(incomingState);

    if (!existingState || incomingTime >= existingTime) {
      merged[studioId] = incomingState;
    }
  }

  return merged;
}

function mergeAlerts(
  existing: StoredProjectState["alerts"] | undefined,
  incoming: StoredProjectState["alerts"] | undefined
) {
  const alertsById = new Map<string, StoredProjectState["alerts"][number]>();

  for (const alert of [...(existing || []), ...(incoming || [])]) {
    if (!alert?.id) continue;
    alertsById.set(alert.id, alert);
  }

  return Array.from(alertsById.values()).sort(
    (left, right) => Date.parse(left.createdAt) - Date.parse(right.createdAt)
  );
}

function mergeProjectStates(
  existing: StoredProjectState | null,
  incoming: StoredProjectState,
  updatedAt: string
): StoredProjectState {
  if (!existing) {
    return {
      ...incoming,
      updatedAt,
    };
  }

  return {
    ...incoming,
    objects: incoming.objects.length > 0 ? incoming.objects : existing.objects,
    studioStates: mergeStudioStates(existing.studioStates, incoming.studioStates),
    notes: incoming.notes.length > 0 ? incoming.notes : existing.notes,
    alerts: mergeAlerts(existing.alerts, incoming.alerts),
    updatedAt,
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
  const incomingProjectState: StoredProjectState = {
    ...project,
    setup: {
      ...project.setup,
      projectNumber,
    },
    updatedAt,
  };
  const existingProject = await loadProjectFromSupabase(projectNumber);
  const projectState = mergeProjectStates(
    existingProject,
    incomingProjectState,
    updatedAt
  );

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

export async function saveStudioStateToSupabase(
  projectNumberInput: string,
  projectPassword: string,
  studioId: string,
  studioState: unknown
) {
  if (!supabaseAdmin) {
    throw new Error("Supabase is not configured.");
  }

  const projectNumber = normalizeProjectNumber(projectNumberInput);
  if (!projectNumber || !studioId.trim()) return null;

  const existingProject = await loadProjectWithPasswordFromSupabase(
    projectNumber,
    projectPassword
  );

  if (!existingProject) return null;

  const updatedAt = new Date().toISOString();
  const nextProjectState: StoredProjectState = {
    ...existingProject,
    setup: {
      ...existingProject.setup,
      projectNumber,
    },
    studioStates: {
      ...(existingProject.studioStates || {}),
      [studioId]: studioState,
    },
    updatedAt,
  };

  const { data, error } = await supabaseAdmin
    .from("team_projects")
    .update({
      project_state: nextProjectState,
      updated_at: updatedAt,
    })
    .in("project_number", projectNumberCandidates(projectNumber))
    .select("project_state")
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data?.project_state as StoredProjectState | undefined) ?? nextProjectState;
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
    .in("project_number", projectNumberCandidates(projectNumber))
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) return null;

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
    .in("project_number", projectNumberCandidates(projectNumber))
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) return null;

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

  const existingProject = await loadProjectFromSupabase(projectNumber);
  const projectNumberValues = projectNumberCandidates(projectNumber);
  const projectKeys = Array.from(
    new Set(
      [
        ...projectNumberValues,
        existingProject?.setup.projectId,
        existingProject?.setup.projectNumber,
      ]
        .map((value) => cleanString(value).trim())
        .filter(Boolean)
    )
  );

  if (projectKeys.length > 0) {
    const { error: feedbackDeleteError } = await supabaseAdmin
      .from("professor_feedback")
      .delete()
      .in("project_key", projectKeys);

    if (feedbackDeleteError) {
      throw feedbackDeleteError;
    }
  }

  const { error } = await supabaseAdmin
    .from("team_projects")
    .delete()
    .in("project_number", projectNumberValues);

  if (error) {
    throw error;
  }

  return true;
}
