import type { ProjectState } from "./ProjectProvider";

const PROJECTS_INDEX_KEY = "policy_lab_projects_v2";
const PROJECT_STORAGE_PREFIX = "policy_lab_project_v2_";
const ACTIVE_PROJECT_STORAGE_KEY = "policy_lab_project_state_v2";
const STUDIO_STORAGE_KEYS: Record<string, string> = {
  problem: "plstudio_problem_engine_v1",
  process: "plstudio_process_engine_v1",
  solution: "plstudio_solution_engine_v1",
  implementation: "plstudio_implementation_engine_v1",
  poster: "plstudio_poster_v3",
  presentation: "plstudio_presentation_v2",
  resourceHub: "plstudio_resource_hub_v1",
};

type ProjectIndexEntry = {
  passwordHash: string;
  updatedAt: string;
  projectId: string;
  groupNumber: string;
  courseName: string;
  professorName: string;
  alertCount?: number;
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

async function readJsonResponse<T>(response: Response) {
  const data = (await response.json().catch(() => null)) as T | null;
  if (!response.ok) return null;

  return data;
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

function buildProjectIndexEntry(project: ProjectState): ProjectIndexEntry {
  return {
    passwordHash: hashPassword(project.setup.projectPassword || ""),
    updatedAt: project.updatedAt || new Date().toISOString(),
    projectId: project.setup.projectId,
    groupNumber: project.setup.groupNumber,
    courseName: project.setup.courseName,
    professorName: project.setup.professorName,
  };
}

function readStoredProject(storageKey: string) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as ProjectState;
    if (!parsed?.setup?.projectNumber?.trim()) return null;

    return parsed;
  } catch (error) {
    console.error("Unable to read stored project:", error);
    return null;
  }
}

function readStoredJson(storageKey: string) {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;

    return JSON.parse(raw) as unknown;
  } catch (error) {
    console.error("Unable to read stored studio state:", error);
    return null;
  }
}

export function buildProjectSnapshot(project: ProjectState): ProjectState {
  const studioStates = {
    ...project.studioStates,
  };

  for (const [studioId, storageKey] of Object.entries(STUDIO_STORAGE_KEYS)) {
    const storedState = readStoredJson(storageKey);
    if (storedState) {
      studioStates[studioId] = storedState;
    }
  }

  return {
    ...project,
    studioStates,
    updatedAt: new Date().toISOString(),
  };
}

function rebuildProjectIndexFromStoredProjects(index: ProjectIndex) {
  let repaired = false;

  try {
    for (let indexPosition = 0; indexPosition < localStorage.length; indexPosition += 1) {
      const storageKey = localStorage.key(indexPosition);
      if (!storageKey?.startsWith(PROJECT_STORAGE_PREFIX)) continue;

      const project = readStoredProject(storageKey);
      if (!project) continue;

      const projectNumber = normalizeProjectNumber(project.setup.projectNumber);
      if (!projectNumber || index[projectNumber]) continue;

      index[projectNumber] = buildProjectIndexEntry(project);
      repaired = true;
    }

    const activeProject = readStoredProject(ACTIVE_PROJECT_STORAGE_KEY);
    const activeProjectNumber = activeProject
      ? normalizeProjectNumber(activeProject.setup.projectNumber)
      : "";

    if (activeProject && activeProjectNumber && !index[activeProjectNumber]) {
      index[activeProjectNumber] = buildProjectIndexEntry(activeProject);
      localStorage.setItem(
        getStorageKey(activeProjectNumber),
        JSON.stringify(activeProject)
      );
      repaired = true;
    }
  } catch (error) {
    console.error("Unable to rebuild project index:", error);
  }

  if (repaired) {
    saveProjectIndex(index);
  }

  return index;
}

function listLocalProjectSummaries() {
  const index = rebuildProjectIndexFromStoredProjects(
    loadProjectIndex()
  );

  return Object.entries(index).map(([projectNumber, entry]) => ({
    projectNumber,
    groupNumber: entry.groupNumber,
    courseName: entry.courseName,
    professorName: entry.professorName,
    updatedAt: entry.updatedAt,
    alertCount: entry.alertCount ?? 0,
  }));
}

function listLocalProjects() {
  return listLocalProjectSummaries()
    .map((summary) => readStoredProject(getStorageKey(summary.projectNumber)))
    .filter((project): project is ProjectState => Boolean(project));
}

export async function saveProjectState(project: ProjectState) {
  const projectSnapshot = buildProjectSnapshot(project);
  const projectNumber = normalizeProjectNumber(
    projectSnapshot.setup.projectNumber
  );

  if (!projectNumber) return false;

  const passwordHash = hashPassword(
    projectSnapshot.setup.projectPassword || ""
  );
  const index = loadProjectIndex();

  const entry: ProjectIndexEntry = buildProjectIndexEntry({
    ...projectSnapshot,
    updatedAt: new Date().toISOString(),
  });

  entry.passwordHash = passwordHash;
  entry.alertCount = Array.isArray(projectSnapshot.alerts)
    ? projectSnapshot.alerts.length
    : 0;

  index[projectNumber] = entry;
  saveProjectIndex(index);

  try {
    localStorage.setItem(
        getStorageKey(projectNumber),
        JSON.stringify(projectSnapshot)
    );
  } catch (error) {
    console.error("Unable to save project:", error);
  }

  try {
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ project: projectSnapshot }),
    });

    const data = await readJsonResponse<{
      ok: boolean;
      project?: ProjectState;
    }>(response);

    if (data?.project) {
      localStorage.setItem(
        getStorageKey(projectNumber),
        JSON.stringify(data.project)
      );
    }

    return Boolean(data?.ok);
  } catch (error) {
    console.error("Unable to save project to Supabase:", error);
    return false;
  }
}

export async function loadProjectByNumber(projectNumber: string) {
  const normalized = normalizeProjectNumber(projectNumber);
  if (!normalized) return null;

  try {
    const response = await fetch(
      `/api/professor-admin/projects/${encodeURIComponent(normalized)}`
    );
    const data = await readJsonResponse<{
      ok: boolean;
      project?: ProjectState;
    }>(response);

    if (data?.project) {
      localStorage.setItem(
        getStorageKey(normalized),
        JSON.stringify(data.project)
      );
      return data.project;
    }
  } catch (error) {
    console.error("Unable to load project from Supabase:", error);
  }

  try {
    return readStoredProject(getStorageKey(normalized));
  } catch (error) {
    console.error("Unable to load project for number:", error);
    return null;
  }
}

export async function loadProjectByNumberAndPassword(
  projectNumber: string,
  projectPassword: string
) {
  const normalized = normalizeProjectNumber(projectNumber);
  if (!normalized) return null;

  try {
    const response = await fetch(
      `/api/projects/${encodeURIComponent(normalized)}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: projectPassword }),
      }
    );
    const data = await readJsonResponse<{
      ok: boolean;
      project?: ProjectState;
    }>(response);

    if (data?.project) {
      localStorage.setItem(
        getStorageKey(normalized),
        JSON.stringify(data.project)
      );
      return data.project;
    }
  } catch (error) {
    console.error("Unable to load project from Supabase:", error);
  }

  const index = loadProjectIndex();
  const entry = index[normalized];
  if (!entry) return null;

  if (entry.passwordHash !== hashPassword(projectPassword)) {
    return null;
  }

  const localProject = readStoredProject(getStorageKey(normalized));
  if (localProject) {
    void saveProjectState(localProject);
  }

  return localProject;
}

export function isProjectNumberTaken(
  projectNumber: string,
  currentProjectId?: string
) {
  const normalized = normalizeProjectNumber(projectNumber);
  if (!normalized) return false;

  const existing = readStoredProject(getStorageKey(normalized));
  if (!existing) return false;
  if (!currentProjectId) return true;

  return existing.setup.projectId !== currentProjectId;
}

export async function listProjectSummaries() {
  const localProjects = listLocalProjects();
  const localSummaries = listLocalProjectSummaries();

  try {
    const response = await fetch("/api/professor-admin/projects");
    const data = await readJsonResponse<{
      ok: boolean;
      projects?: Array<{
        projectNumber: string;
        groupNumber: string;
        courseName: string;
        professorName: string;
        updatedAt: string;
        alertCount?: number;
      }>;
    }>(response);

    if (Array.isArray(data?.projects)) {
      const remoteProjectNumbers = new Set(
        data.projects.map((project) =>
          normalizeProjectNumber(project.projectNumber)
        )
      );

      for (const project of localProjects) {
        const projectNumber = normalizeProjectNumber(
          project.setup.projectNumber
        );

        if (!remoteProjectNumbers.has(projectNumber)) {
          void saveProjectState(project);
        }
      }

      const merged = [...data.projects];

      for (const summary of localSummaries) {
        if (
          !remoteProjectNumbers.has(
            normalizeProjectNumber(summary.projectNumber)
          )
        ) {
          merged.push(summary);
        }
      }

      return merged;
    }
  } catch (error) {
    console.error("Unable to list projects from Supabase:", error);
  }

  return localSummaries;
}

export async function deleteProjectState(projectNumber: string) {
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

  try {
    const response = await fetch(
      `/api/professor-admin/projects/${encodeURIComponent(normalized)}`,
      { method: "DELETE" }
    );

    if (!response.ok) return false;
  } catch (error) {
    console.error("Unable to delete project from Supabase:", error);
    return false;
  }

  return true;
}

export async function saveProjectNotes(
  projectNumber: string,
  notes: ProjectState["notes"]
) {
  const project = await loadProjectByNumber(projectNumber);
  if (!project) return false;

  return saveProjectState({
    ...project,
    notes,
    updatedAt: new Date().toISOString(),
  });
}
