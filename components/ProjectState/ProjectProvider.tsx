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

export type ProjectState = {
  objects: ProjectObject[];
  updatedAt: string | null;
};

type ProjectContextValue = {
  project: ProjectState;
  importObjects: (objects: ProjectObject[]) => void;
  clearProject: () => void;
};

const STORAGE_KEY = "policy_lab_project_state_v1";

const initialProject: ProjectState = {
  objects: [],
  updatedAt: null,
};

const ProjectContext = createContext<ProjectContextValue | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [project, setProject] = useState<ProjectState>(initialProject);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.objects)) {
        setProject({
          objects: parsed.objects,
          updatedAt: parsed.updatedAt ?? null,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  }, [project]);

  const importObjects = (objects: ProjectObject[]) => {
    setProject((prev) => {
      const withoutDuplicates = prev.objects.filter(
        (existing) =>
          !objects.some(
            (incoming) =>
              incoming.id === existing.id &&
              incoming.studioId === existing.studioId
          )
      );

      return {
        objects: [...withoutDuplicates, ...objects],
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const clearProject = () => {
    setProject(initialProject);
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo(
    () => ({
      project,
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
    throw new Error("useProject must be used inside ProjectProvider");
  }

  return context;
}