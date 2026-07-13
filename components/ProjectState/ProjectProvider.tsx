"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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

export type ProjectSetup = {
  projectId: string;
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
  updatedAt: string | null;
};

type ProjectContextValue = {
  project: ProjectState;
  updateSetup: (changes: Partial<ProjectSetup>) => void;
  replaceSetup: (setup: ProjectSetup) => void;
  importObjects: (objects: ProjectObject[]) => void;
  clearProject: () => void;
};

const STORAGE_KEY = "policy_lab_project_state_v2";

const initialSetup: ProjectSetup = {
  projectId: crypto.randomUUID(),

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

  const clearProject = () => {
    setProject(initialProject);

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
      importObjects,
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
