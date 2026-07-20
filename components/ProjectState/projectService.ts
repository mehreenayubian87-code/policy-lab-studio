import type { ProjectObject, ProjectState, ProjectStudioId } from "./ProjectProvider";

type StoredStudioObject = {
  id: string;
  title: string;
  type: string;
  content?: string;
  createdIn?: string;
  color?: string;
  width?: number;
  height?: number;
  icon?: string;
  imageDataUrl?: string;
  visualType?: "image" | "chart" | "icon";
  chartType?: "bar" | "line" | "pie" | "scatter";
  chartData?: Array<{ label: string; value: number }>;
  embeddedVisuals?: Array<{
    id: string;
    insertIndex?: number;
    imageDataUrl?: string;
    visualType?: "image" | "chart";
    chartType?: "bar" | "line" | "pie" | "scatter";
    chartData?: Array<{ label: string; value: number }>;
    icon?: string;
  }>;
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
      color: object.color,
      width: object.width,
      height: object.height,
      icon: object.icon,
      imageDataUrl: object.imageDataUrl,
      visualType: object.visualType,
      chartType: object.chartType,
      chartData: object.chartData,
      embeddedVisuals: object.embeddedVisuals,
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

export function readAllStudioObjectsFromProject(project: ProjectState): ProjectObject[] {
  const studioIds: Array<Exclude<ProjectStudioId, "poster">> = [
    "problem",
    "process",
    "solution",
    "implementation",
  ];

  return studioIds.flatMap((studioId) => {
    const state = project.studioStates?.[studioId];
    const objects: StoredStudioObject[] =
      state && typeof state === "object" && Array.isArray((state as StoredStudioState).objects)
        ? (state as StoredStudioState).objects ?? []
        : [];

    return objects.flatMap((object) => {
      const projectObjects: ProjectObject[] = [
        {
          id: object.id,
          title: object.title,
          type: object.type,
          content: [object.icon, object.content].filter(Boolean).join(" ").trim(),
          studioId,
          color: object.color,
          width: object.width,
          height: object.height,
          icon: object.icon,
          imageDataUrl: object.imageDataUrl,
          visualType: object.visualType,
          chartType: object.chartType,
          chartData: object.chartData,
          embeddedVisuals: object.embeddedVisuals,
        },
      ];

      return projectObjects.filter((object) => object.content.trim());
    });
  });
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
  const hasEmbeddedVisual = (
    object: ProjectObject,
    visualType: "image" | "chart"
  ) =>
    object.embeddedVisuals?.some(
      (visual) =>
        visual.visualType === visualType ||
        (visualType === "image" && Boolean(visual.imageDataUrl)) ||
        (visualType === "chart" && Boolean(visual.chartData?.length))
    );

  const findByTypes = (types: string[]) =>
    objects
      .filter((object) => types.includes(object.type))
      .map((object) => `${object.title}: ${object.content}`)
      .filter(Boolean)
      .join("\n\n");
  const findByVisual = (visualType: "image" | "chart" | "icon") =>
    objects
      .filter((object) =>
        object.visualType === visualType ||
        (visualType === "image" && (Boolean(object.imageDataUrl) || hasEmbeddedVisual(object, "image"))) ||
        (visualType === "chart" && (Boolean(object.chartData?.length) || hasEmbeddedVisual(object, "chart"))) ||
        (visualType === "icon" && Boolean(object.icon))
      )
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
    indicators: [findByTypes(["indicator", "chart"]), findByVisual("chart")]
      .filter(Boolean)
      .join("\n\n"),
    images: [findByTypes(["image", "aiVisual"]), findByVisual("image")]
      .filter(Boolean)
      .join("\n\n"),
    icons: [findByTypes(["icon", "aiVisual"]), findByVisual("icon")]
      .filter(Boolean)
      .join("\n\n"),
    personas: findByTypes(["persona"]),
  };
}
