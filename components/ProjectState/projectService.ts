import type { ProjectObject, ProjectStudioId } from "./ProjectProvider";

type StoredStudioObject = {
  id: string;
  title: string;
  type: string;
  content?: string;
  createdIn?: string;
};

type StoredStudioState = {
  objects?: StoredStudioObject[];
};

const studioStorageKeys: Record<
  Exclude<ProjectStudioId, "poster">,
  string
> = {
  problem: "plstudio_problem_engine_v1",
  process: "plstudio_process_engine_v1",
  solution: "plstudio_solution_engine_v1",
  implementation: "plstudio_implementation_engine_v1",
};

export function readStudioObjects(
  studioId: Exclude<ProjectStudioId, "poster">
): ProjectObject[] {
  try {
    const raw = localStorage.getItem(studioStorageKeys[studioId]);
    if (!raw) return [];

    const parsed: StoredStudioState = JSON.parse(raw);
    if (!Array.isArray(parsed.objects)) return [];

    return parsed.objects.map((object) => ({
      id: object.id,
      title: object.title,
      type: object.type,
      content: object.content ?? "",
      studioId,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export function readAllStudioObjects(): ProjectObject[] {
  return [
    ...readStudioObjects("problem"),
    ...readStudioObjects("process"),
    ...readStudioObjects("solution"),
    ...readStudioObjects("implementation"),
  ];
}

export function getObjectsByStudio(
  objects: ProjectObject[],
  studioId: ProjectStudioId
) {
  return objects.filter((object) => object.studioId === studioId);
}

export function getObjectsByType(objects: ProjectObject[], type: string) {
  return objects.filter((object) => object.type === type);
}

export function buildPosterContent(objects: ProjectObject[]) {
  const findByTypes = (types: string[]) =>
    objects
      .filter((object) => types.includes(object.type))
      .map((object) => `${object.title}: ${object.content}`)
      .filter(Boolean)
      .join("\n\n");

  return {
    problem: findByTypes(["problem", "hmw", "rootCause", "problemTree"]),
    evidence: findByTypes(["evidence", "statistic", "source"]),
    population: findByTypes(["persona", "journey"]),
    stakeholders: findByTypes(["stakeholder", "systemNode"]),
    solution: findByTypes(["idea", "theoryOfChange"]),
    implementation: findByTypes(["timeline", "budget"]),
    risks: findByTypes(["risk", "mitigation"]),
    indicators: findByTypes(["indicator", "chart"]),
  };
}