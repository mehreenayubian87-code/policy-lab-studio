"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { saveProjectState } from "./projectStorage";

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

export function ProjectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [project, setProject] =
    useState<ProjectState>(initialProject);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const parsed = JSON.parse(raw);

        setProject({
          setup: normalizeSetup(parsed.setup),
          objects: Array.isArray(parsed.objects)
            ? parsed.objects
            : [],
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
      saveProjectState(project);
    } catch (error) {
      console.error("Unable to persist project storage:", error);
    }
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
          saveProjectState(previous);
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
