"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  buildProjectSnapshot,
  saveProjectState,
} from "./projectStorage";

export type ProjectStudioId =
  | "problem"
  | "process"
  | "solution"
  | "implementation"
  | "poster";

export type ProjectObject = {
  id: string;
  title: string;
  type: string;
  content: string;
  studioId: ProjectStudioId;
};

export type ProjectStudent = {
  name: string;
  email: string;
};

export type ProjectNote = {
  id: string;
  content: string;
  createdAt: string;
  createdBy: string;
};

export type ProjectAlert = {
  id: string;
  studioId: string;
  studioName: string;
  message: string;
  note?: string;
  createdAt: string;
};

export type ProjectSetup = {
  projectId: string;
  projectNumber: string;
  projectPassword: string;
  groupNumber: string;
  courseName: string;
  professorName: string;
  professorEmail: string;
  policyIssue: string;
  students: ProjectStudent[];
  teamLead: string;
};

export type ProjectState = {
  setup: ProjectSetup;
  objects: ProjectObject[];
  studioStates: Record<string, unknown>;
  notes: ProjectNote[];
  alerts: ProjectAlert[];
  updatedAt: string | null;
};

type StoredProjectEntry = {
  passwordHash: string;
  projectState: ProjectState;
};

type ProjectContextValue = {
  project: ProjectState;
  updateSetup: (changes: Partial<ProjectSetup>) => void;
  replaceSetup: (setup: ProjectSetup) => void;
  replaceProject: (project: ProjectState) => void;
  importObjects: (objects: ProjectObject[]) => void;
  updateStudioState: (studioId: string, state: unknown) => void;
  appendAlert: (studioId: string, studioName: string, message: string, note?: string) => void;
  clearProject: () => void;
};

const STORAGE_KEY = "policy_lab_project_state_v2";

const initialSetup: ProjectSetup = {
  projectId: crypto.randomUUID(),
  projectNumber: "",
  projectPassword: "",
  groupNumber: "",
  courseName: "",
  professorName: "",
  professorEmail: "",
  policyIssue: "",
  students: [
    { name: "", email: "" },
    { name: "", email: "" },
    { name: "", email: "" },
    { name: "", email: "" },
    { name: "", email: "" },
  ],
  teamLead: "",
};

const initialProject: ProjectState = {
  setup: initialSetup,
  objects: [],
  studioStates: {},
  notes: [],
  alerts: [],
  updatedAt: null,
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

function normalizeStudents(value: unknown): ProjectStudent[] {
  const students = Array.isArray(value)
    ? value.slice(0, 5).map((student) => ({
        name:
          typeof student?.name === "string"
            ? student.name
            : "",
        email:
          typeof student?.email === "string"
            ? student.email
            : "",
      }))
    : [];

  while (students.length < 5) {
    students.push({ name: "", email: "" });
  }

  return students;
}

function normalizeAlerts(value: unknown): ProjectAlert[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is ProjectAlert => Boolean(item && typeof item === "object"))
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : crypto.randomUUID(),
      studioId: typeof item.studioId === "string" ? item.studioId : "unknown",
      studioName: typeof item.studioName === "string" ? item.studioName : "Unknown Studio",
      message: typeof item.message === "string" ? item.message : "",
      note: typeof item.note === "string" ? item.note : undefined,
      createdAt: typeof item.createdAt === "string" ? item.createdAt : new Date().toISOString(),
    }))
    .filter((item) => item.message.trim());
}

function normalizeSetup(value: unknown): ProjectSetup {
  const setup =
    value && typeof value === "object"
      ? (value as Partial<ProjectSetup>)
      : {};

  return {
    projectId:
  typeof setup.projectId === "string" &&
  setup.projectId.length > 0
    ? setup.projectId
    : crypto.randomUUID(),
    
    projectNumber:
      typeof setup.projectNumber === "string"
        ? setup.projectNumber
        : "",
    projectPassword:
      typeof setup.projectPassword === "string"
        ? setup.projectPassword
        : "",
    groupNumber:
      typeof setup.groupNumber === "string"
        ? setup.groupNumber
        : "",
    courseName:
      typeof setup.courseName === "string"
        ? setup.courseName
        : "",
    professorName:
      typeof setup.professorName === "string"
        ? setup.professorName
        : "",
    professorEmail:
      typeof setup.professorEmail === "string"
        ? setup.professorEmail
        : "",
    policyIssue:
      typeof setup.policyIssue === "string"
        ? setup.policyIssue
        : "",
    students: normalizeStudents(setup.students),
    teamLead:
      typeof setup.teamLead === "string"
        ? setup.teamLead
        : "",
  };
}

function areJsonValuesEqual(left: unknown, right: unknown) {
  try {
    return JSON.stringify(left) === JSON.stringify(right);
  } catch {
    return false;
  }
}

export function ProjectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [project, setProject] =
    useState<ProjectState>(initialProject);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const hydrateProject = async () => {
      try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw);
        const parsedSetup = normalizeSetup(parsed.setup);

        if (parsedSetup.projectNumber.trim() && parsedSetup.projectPassword) {
          try {
            const response = await fetch(
              `/api/projects/${encodeURIComponent(parsedSetup.projectNumber.trim())}`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  password: parsedSetup.projectPassword,
                }),
              }
            );
            const data = (await response.json().catch(() => null)) as {
              ok?: boolean;
              project?: ProjectState;
            } | null;

            if (response.ok && data?.project) {
              setProject({
                ...data.project,
                setup: normalizeSetup(data.project.setup),
                objects: Array.isArray(data.project.objects)
                  ? data.project.objects
                  : [],
                studioStates:
                  data.project.studioStates && typeof data.project.studioStates === "object"
                    ? data.project.studioStates
                    : {},
                notes: Array.isArray(data.project.notes)
                  ? data.project.notes
                  : [],
                alerts: normalizeAlerts(data.project.alerts),
                updatedAt:
                  typeof data.project.updatedAt === "string"
                    ? data.project.updatedAt
                    : null,
              });
              localStorage.setItem(STORAGE_KEY, JSON.stringify(data.project));
              return;
            }
          } catch (error) {
            console.error("Unable to refresh active project from Supabase:", error);
          }

          localStorage.removeItem(STORAGE_KEY);
          setProject(initialProject);
          return;
        }

        setProject({
          setup: parsedSetup,
          objects: Array.isArray(parsed.objects)
            ? parsed.objects
            : [],
          studioStates:
            parsed.studioStates && typeof parsed.studioStates === "object"
              ? parsed.studioStates
              : {},
          notes: Array.isArray(parsed.notes) ? parsed.notes : [],
          alerts: normalizeAlerts(parsed.alerts),
          updatedAt:
            typeof parsed.updatedAt === "string"
              ? parsed.updatedAt
              : null,
        });
      } else {
        const oldRaw = localStorage.getItem(
          "policy_lab_project_state_v1"
        );

        if (oldRaw) {
          const oldParsed = JSON.parse(oldRaw);

          setProject({
            setup: initialSetup,
            objects: Array.isArray(oldParsed.objects)
              ? oldParsed.objects
              : [],
            studioStates: {},
            notes: [],
            alerts: [],
            updatedAt:
              typeof oldParsed.updatedAt === "string"
                ? oldParsed.updatedAt
                : null,
          });
        }
      }
    } catch (error) {
      console.error("Unable to load project state:", error);
    } finally {
      setHydrated(true);
    }

    };

    void hydrateProject();
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(project)
      );
    } catch (error) {
      console.error("Unable to save project state:", error);
    }
  }, [hydrated, project]);

  useEffect(() => {
    if (!hydrated) return;
    if (!project.setup.projectNumber.trim()) return;

    try {
      void saveProjectState(project);
    } catch (error) {
      console.error("Unable to persist project storage:", error);
    }
  }, [hydrated, project]);

  useEffect(() => {
    if (!hydrated) return;
    if (!project.setup.projectNumber.trim()) return;

    const flushProject = () => {
      const projectSnapshot = buildProjectSnapshot(project);
      const payload = JSON.stringify({ project: projectSnapshot });

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projectSnapshot));
      } catch (error) {
        console.error("Unable to save project snapshot locally:", error);
      }

      if (navigator.sendBeacon) {
        const blob = new Blob([payload], {
          type: "application/json",
        });

        if (navigator.sendBeacon("/api/projects", blob)) {
          return;
        }
      }

      void fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: payload,
        keepalive: true,
      }).catch((error) => {
        console.error("Unable to flush project before unload:", error);
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        flushProject();
      }
    };

    window.addEventListener("pagehide", flushProject);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", flushProject);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hydrated, project]);

  const updateSetup = (
    changes: Partial<ProjectSetup>
  ) => {
    setProject((previous) => ({
      ...previous,
      setup: {
        ...previous.setup,
        ...changes,
        students:
          changes.students !== undefined
            ? normalizeStudents(changes.students)
            : previous.setup.students,
      },
      updatedAt: new Date().toISOString(),
    }));
  };

  const replaceProject = (projectState: ProjectState) => {
    setProject({
      ...projectState,
      setup: normalizeSetup(projectState.setup),
      objects: Array.isArray(projectState.objects)
        ? projectState.objects
        : [],
      studioStates:
        projectState.studioStates && typeof projectState.studioStates === "object"
          ? projectState.studioStates
          : {},
      notes: Array.isArray(projectState.notes)
        ? projectState.notes
        : [],
      updatedAt: new Date().toISOString(),
    });
  };

  const replaceSetup = (setup: ProjectSetup) => {
    setProject((previous) => ({
      ...previous,
      setup: normalizeSetup(setup),
      updatedAt: new Date().toISOString(),
    }));
  };

  const importObjects = (
    objects: ProjectObject[]
  ) => {
    setProject((previous) => {
      const withoutDuplicates =
        previous.objects.filter(
          (existing) =>
            !objects.some(
              (incoming) =>
                incoming.id === existing.id &&
                incoming.studioId === existing.studioId
            )
        );

      return {
        ...previous,
        objects: [
          ...withoutDuplicates,
          ...objects,
        ],
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const updateStudioState = useCallback((studioId: string, state: unknown) => {
    setProject((previous) => {
      if (areJsonValuesEqual(previous.studioStates[studioId], state)) {
        return previous;
      }

      return {
        ...previous,
        studioStates: {
          ...previous.studioStates,
          [studioId]: state,
        },
        updatedAt: new Date().toISOString(),
      };
    });
  }, []);

  const appendAlert = (
    studioId: string,
    studioName: string,
    message: string,
    note?: string
  ) => {
    if (!message.trim()) return;

    setProject((previous) => ({
      ...previous,
      alerts: [
        ...previous.alerts,
        {
          id: crypto.randomUUID(),
          studioId,
          studioName,
          message: message.trim(),
          note: note?.trim() ? note.trim() : undefined,
          createdAt: new Date().toISOString(),
        },
      ],
      updatedAt: new Date().toISOString(),
    }));
  };

  const clearProject = () => {
    setProject((previous) => {
      if (previous.setup.projectNumber.trim()) {
        try {
          void saveProjectState(previous);
        } catch (error) {
          console.error("Unable to persist project before logout:", error);
        }
      }

      return initialProject;
    });

    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(
        "policy_lab_project_state_v1"
      );
    } catch (error) {
      console.error("Unable to clear project state:", error);
    }
  };

  const value = useMemo(
    () => ({
      project,
      updateSetup,
      replaceSetup,
      replaceProject,
      importObjects,
      updateStudioState,
      appendAlert,
      clearProject,
    }),
    [project]
  );

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);

  if (!context) {
    throw new Error(
      "useProject must be used inside ProjectProvider"
    );
  }

  return context;
}
