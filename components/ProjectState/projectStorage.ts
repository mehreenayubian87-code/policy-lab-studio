import type { ProjectState } from "./ProjectProvider";

const PROJECTS_INDEX_KEY = "policy_lab_projects_v2";
const PROJECT_STORAGE_PREFIX = "policy_lab_project_v2_";

type ProjectIndexEntry = {
  passwordHash: string;
  updatedAt: string;
  projectId: string;
  groupNumber: string;
  courseName: string;
  professorName: string;
};

type ProjectIndex = Record<string, ProjectIndexEntry>;

function normalizeProjectNumber(value: string) {
  return value.trim().toUpperCase();
}

function hashPassword(value: string) {
  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }

  return hash.toString(16);
}

function loadProjectIndex(): ProjectIndex {
  try {
    const raw = localStorage.getItem(PROJECTS_INDEX_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};

    return parsed as ProjectIndex;
  } catch (error) {
    console.error("Unable to load project index:", error);
    return {};
  }
}

function saveProjectIndex(index: ProjectIndex) {
  try {
    localStorage.setItem(
      PROJECTS_INDEX_KEY,
      JSON.stringify(index)
    );
  } catch (error) {
    console.error("Unable to save project index:", error);
  }
}

function getStorageKey(projectNumber: string) {
  return `${PROJECT_STORAGE_PREFIX}${normalizeProjectNumber(
    projectNumber
  )}`;
}

export function saveProjectState(project: ProjectState) {
  const projectNumber = normalizeProjectNumber(
    project.setup.projectNumber
  );

  if (!projectNumber) return;

  const passwordHash = hashPassword(
    project.setup.projectPassword || ""
  );
  const index = loadProjectIndex();

  const entry: ProjectIndexEntry = {
    passwordHash,
    updatedAt: new Date().toISOString(),
    projectId: project.setup.projectId,
    groupNumber: project.setup.groupNumber,
    courseName: project.setup.courseName,
    professorName: project.setup.professorName,
  };

  index[projectNumber] = entry;
  saveProjectIndex(index);

  try {
    localStorage.setItem(
      getStorageKey(projectNumber),
      JSON.stringify(project)
    );
  } catch (error) {
    console.error("Unable to save project:", error);
  }
}

export function loadProjectByNumber(projectNumber: string) {
  const normalized = normalizeProjectNumber(projectNumber);
  if (!normalized) return null;

  try {
    const raw = localStorage.getItem(getStorageKey(normalized));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed as ProjectState;
  } catch (error) {
    console.error("Unable to load project for number:", error);
    return null;
  }
}

export function loadProjectByNumberAndPassword(
  projectNumber: string,
  projectPassword: string
) {
  const normalized = normalizeProjectNumber(projectNumber);
  if (!normalized) return null;

  const index = loadProjectIndex();
  const entry = index[normalized];
  if (!entry) return null;

  if (entry.passwordHash !== hashPassword(projectPassword)) {
    return null;
  }

  return loadProjectByNumber(normalized);
}

export function isProjectNumberTaken(
  projectNumber: string,
  currentProjectId?: string
) {
  const normalized = normalizeProjectNumber(projectNumber);
  if (!normalized) return false;

  const existing = loadProjectByNumber(normalized);
  if (!existing) return false;
  if (!currentProjectId) return true;

  return existing.setup.projectId !== currentProjectId;
}

export function listProjectSummaries() {
  const index = loadProjectIndex();
  return Object.entries(index).map(([projectNumber, entry]) => ({
    projectNumber,
    groupNumber: entry.groupNumber,
    courseName: entry.courseName,
    professorName: entry.professorName,
    updatedAt: entry.updatedAt,
  }));
}

export function deleteProjectState(projectNumber: string) {
  const normalized = normalizeProjectNumber(projectNumber);
  if (!normalized) return false;

  const index = loadProjectIndex();
  delete index[normalized];
  saveProjectIndex(index);

  try {
    localStorage.removeItem(getStorageKey(normalized));
  } catch (error) {
    console.error("Unable to delete project:", error);
    return false;
  }

  return true;
}

export function saveProjectNotes(
  projectNumber: string,
  notes: ProjectState["notes"]
) {
  const project = loadProjectByNumber(projectNumber);
  if (!project) return false;

  saveProjectState({
    ...project,
    notes,
    updatedAt: new Date().toISOString(),
  });

  return true;
}
