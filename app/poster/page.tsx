"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useAdminSession } from "@/components/TeamAccess/TeamSessionBar";
import { useProject } from "@/components/ProjectState/ProjectProvider";
import type { ProjectObject, ProjectStudioId } from "@/components/ProjectState/ProjectProvider";
import {
  buildPosterContent,
  readAllStudioObjectsFromProject,
} from "@/components/ProjectState/projectService";
import {
  getProjectStudioStorageKey,
  trySetLocalStorageItem,
} from "@/components/ProjectState/projectStorage";
import styles from "./poster.module.css";

type PosterBlockKind =
  | "section"
  | "textbox"
  | "image"
  | "chart"
  | "icon"
  | "shape"
  | "callout"
  | "divider";

type PosterShapeType =
  | "arrow"
  | "arrow-left"
  | "arrow-up"
  | "arrow-down"
  | "line"
  | "line-vertical"
  | "connector-elbow"
  | "connector-curve"
  | "rectangle"
  | "circle"
  | "chevron";

type PosterBlock = {
  id: string;
  number: string;
  title: string;
  type: string;
  content: string;
  accent: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: PosterBlockKind;
  imageUrl?: string;
  caption?: string;
  altText?: string;
  borderStyle?: "none" | "rounded" | "shadow" | "frame";
  imported?: boolean;
  sourceColor?: string;
  borderColor?: string;
  textColor?: string;
  icon?: string;
  shapeType?: PosterShapeType;
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

type PosterHeader = {
  title: string;
  subtitle: string;
  logo: string;
  logoImageUrl?: string;
  team: string;
  course: string;
  instructor: string;
};

type ThemeName = "academic" | "modern" | "minimal" | "dark" | "institutional";
type PosterSize = "A0" | "A1" | "A2";
type Orientation = "portrait" | "landscape";
type LayoutName = "sequence";
type SideTab =
  | "Elements"
  | "Text"
  | "Smart Art"
  | "Visuals"
  | "Layout"
  | "Theme"
  | "Import"
  | "Coach";

const smartArtOptions: Array<{
  shapeType: PosterShapeType;
  label: string;
  description: string;
}> = [
  { shapeType: "arrow", label: "Arrow Right", description: "Directional arrow for forward flow" },
  { shapeType: "arrow-left", label: "Arrow Left", description: "Directional arrow pointing left" },
  { shapeType: "arrow-up", label: "Arrow Up", description: "Directional arrow pointing upward" },
  { shapeType: "arrow-down", label: "Arrow Down", description: "Directional arrow pointing downward" },
  { shapeType: "line", label: "Line Horizontal", description: "Straight horizontal connector line" },
  { shapeType: "line-vertical", label: "Line Vertical", description: "Straight vertical connector line" },
  { shapeType: "connector-elbow", label: "Elbow Connector", description: "Right-angle connector for linked items" },
  { shapeType: "connector-curve", label: "Curved Connector", description: "Curved connector for linked items" },
  { shapeType: "rectangle", label: "Rectangle", description: "Outlined panel or grouping shape" },
  { shapeType: "circle", label: "Circle", description: "Round highlight or callout shape" },
  { shapeType: "chevron", label: "Chevron", description: "Process or transition marker" },
];

const smartArtGroups: Array<{
  title: string;
  items: PosterShapeType[];
}> = [
  { title: "Shapes", items: ["rectangle", "circle", "chevron"] },
  { title: "Arrows", items: ["arrow", "arrow-left", "arrow-up", "arrow-down"] },
  { title: "Connectors", items: ["line", "line-vertical", "connector-elbow", "connector-curve"] },
];

const POSTER_STORAGE_KEY = "plstudio_poster_v3";
const AUTOSAVE_INTERVAL_MS = 45000;

const initialHeader: PosterHeader = {
  title: "POLICY POSTER TITLE",
  subtitle:
    "A policy proposal to improve outcomes through evidence, implementation planning, and stakeholder engagement.",
  logo: "🏫",
  team: "Team Name",
  course: "Course / Policy Lab",
  instructor: "Instructor",
};

const initialBlocks: PosterBlock[] = [];

const importOptions = [
  ["problem", "Problem Statement"],
  ["evidence", "Evidence"],
  ["stakeholders", "Stakeholders"],
  ["journey", "User Journey"],
  ["solution", "Theory of Change / Solution"],
  ["indicators", "Dashboard / Indicators"],
  ["timeline", "Timeline"],
  ["images", "Images"],
  ["charts", "Charts"],
  ["icons", "Icons"],
  ["personas", "Personas"],
] as const;

const sourceStudios = [
  ["problem", "Problem Studio"],
  ["process", "Process Studio"],
  ["solution", "Solution Studio"],
  ["implementation", "Implementation Studio"],
] as const;

const sideTabs: { icon: string; label: SideTab }[] = [
  { icon: "🧩", label: "Elements" },
  { icon: "↗", label: "Smart Art" },
  { icon: "▦", label: "Layout" },
  { icon: "🎨", label: "Theme" },
  { icon: "⬆", label: "Import" },
];

const themeMap: Record<
  ThemeName,
  {
    label: string;
    primary: string;
    secondary: string;
    accent: string;
    bg: string;
    panel: string;
    text: string;
    mutedText: string;
    textboxBg: string;
    importedTextboxBg: string;
    chartBg: string;
    iconBg: string;
    calloutBg: string;
    dividerBg: string;
    line: string;
  }
> = {
  academic: {
    label: "Academic Blue",
    primary: "#1e3a5f",
    secondary: "#2b5876",
    accent: "#d4a574",
    bg: "#f7f4ec",
    panel: "#fffdf8",
    text: "#14243d",
    mutedText: "#4b5563",
    textboxBg: "#fff8ea",
    importedTextboxBg: "#f7ecd2",
    chartBg: "#edf5f8",
    iconBg: "#f2eefb",
    calloutBg: "#f9edd9",
    dividerBg: "#f3efe6",
    line: "#d8e0ee",
  },
  modern: {
    label: "Modern",
    primary: "#0f766e",
    secondary: "#155e75",
    accent: "#d97706",
    bg: "#f3fbf9",
    panel: "#ffffff",
    text: "#12323a",
    mutedText: "#52606d",
    textboxBg: "#f4fbf8",
    importedTextboxBg: "#e4f5ee",
    chartBg: "#edf8fb",
    iconBg: "#edf2ff",
    calloutBg: "#fff3e2",
    dividerBg: "#eff7f6",
    line: "#cbd5e1",
  },
  minimal: {
    label: "Minimal",
    primary: "#111827",
    secondary: "#334155",
    accent: "#64748b",
    bg: "#f8fafc",
    panel: "#ffffff",
    text: "#111827",
    mutedText: "#475569",
    textboxBg: "#ffffff",
    importedTextboxBg: "#f8fafc",
    chartBg: "#f1f5f9",
    iconBg: "#f8fafc",
    calloutBg: "#f3f4f6",
    dividerBg: "#e5e7eb",
    line: "#cbd5e1",
  },
  dark: {
    label: "Dark",
    primary: "#0f172a",
    secondary: "#1e293b",
    accent: "#38bdf8",
    bg: "#eaf2f7",
    panel: "#ffffff",
    text: "#0f172a",
    mutedText: "#475569",
    textboxBg: "#ffffff",
    importedTextboxBg: "#e5f3fb",
    chartBg: "#edf6ff",
    iconBg: "#eef2ff",
    calloutBg: "#fff5df",
    dividerBg: "#e2e8f0",
    line: "#bfd0df",
  },
  institutional: {
    label: "Institutional",
    primary: "#23405f",
    secondary: "#7c5a2c",
    accent: "#c89b3c",
    bg: "#f8f3e8",
    panel: "#fffdf7",
    text: "#213547",
    mutedText: "#5b6470",
    textboxBg: "#fffaf0",
    importedTextboxBg: "#f4ead0",
    chartBg: "#eef4f1",
    iconBg: "#f5f0fb",
    calloutBg: "#fdf0dc",
    dividerBg: "#efe6d7",
    line: "#d7d3c8",
  },
};

const posterDimensionMap: Record<
  PosterSize,
  Record<Orientation, { width: number; height: number }>
> = {
  A0: {
    landscape: { width: 1980, height: 1400 },
    portrait: { width: 1400, height: 1980 },
  },
  A1: {
    landscape: { width: 1400, height: 990 },
    portrait: { width: 990, height: 1400 },
  },
  A2: {
    landscape: { width: 990, height: 700 },
    portrait: { width: 700, height: 990 },
  },
};

const LAYOUT_REFERENCE_WIDTH = 1360;
const LAYOUT_REFERENCE_HEIGHT = 1420;
const orderedStudioIds: Array<Exclude<ProjectStudioId, "poster">> = [
  "problem",
  "process",
  "solution",
  "implementation",
];

const placeholderTexts = ["describe", "add", "summarize", "placeholder"];

const isImportedBlock = (block: PosterBlock) =>
  Boolean(block.imported) ||
  block.id.startsWith("import-") ||
  block.id.startsWith("chart-") ||
  block.id.startsWith("icon-") ||
  block.type.toLowerCase().includes("imported from");

const importTypeMap: Record<string, string[]> = {
  problem: ["problem", "hmw", "rootCause", "problemTree"],
  evidence: ["evidence", "statistic", "source"],
  stakeholders: ["stakeholder", "systemNode"],
  journey: ["persona", "journey"],
  solution: ["idea", "theoryOfChange"],
  indicators: ["indicator", "chart"],
  timeline: ["timeline"],
  images: ["image", "aiVisual"],
  charts: ["chart", "indicator"],
  icons: ["icon", "aiVisual"],
  personas: ["persona"],
};

const clampPosterSize = (value: number | undefined, fallback: number, min: number, max: number) =>
  Math.min(max, Math.max(min, typeof value === "number" && Number.isFinite(value) ? value : fallback));

const fitFrameWithinPoster = (
  frame: { x: number; y: number; width: number; height: number },
  dimensions: { width: number; height: number },
  margin = 24
) => {
  const maxWidth = Math.max(140, dimensions.width - margin * 2);
  const maxHeight = Math.max(90, dimensions.height - margin * 2);
  const width = Math.min(frame.width, maxWidth);
  const height = Math.min(frame.height, maxHeight);
  const maxX = Math.max(margin, dimensions.width - width - margin);
  const maxY = Math.max(margin, dimensions.height - height - margin);

  return {
    x: Math.min(maxX, Math.max(margin, frame.x)),
    y: Math.min(maxY, Math.max(margin, frame.y)),
    width,
    height,
  };
};

const getProjectObjectImportKey = (object: ProjectObject) => {
  const baseId = object.id.replace(/-(image|chart|icon)$/, "");
  const hasEmbeddedImage = object.embeddedVisuals?.some(
    (visual) => visual.imageDataUrl || visual.visualType === "image"
  );
  const hasEmbeddedChart = object.embeddedVisuals?.some(
    (visual) => visual.chartData?.length || visual.visualType === "chart"
  );
  const visualKind =
    object.imageDataUrl || object.visualType === "image" || object.type === "image" || hasEmbeddedImage
      ? "image"
      : object.chartData?.length || object.visualType === "chart" || object.type === "chart" || hasEmbeddedChart
      ? "chart"
      : object.visualType === "icon" || object.type === "icon"
      ? "icon"
      : object.type;

  return `${object.studioId}:${baseId}:${visualKind}`;
};

const getElementSelectionKey = (object: ProjectObject) =>
  `${object.studioId}:${object.id}`;

const stripLeadingDefaultIcon = (value: string) =>
  value.replace(/^(?:\p{Extended_Pictographic}|\p{Emoji_Presentation})(?:\uFE0F|\uFE0F\u20E3)?\s+/u, "");

const isImportedDefaultIconBlock = (block: PosterBlock) =>
  isImportedBlock(block) &&
  block.kind === "icon" &&
  !block.title.toLowerCase().includes("icon");

const getImportedStudioId = (
  block: PosterBlock
): Exclude<ProjectStudioId, "poster"> | null => {
  if (!isImportedBlock(block)) return null;

  const normalizedType = block.type.toLowerCase();
  const normalizedId = block.id.toLowerCase();

  if (normalizedType.includes("problem studio") || normalizedId.includes("import-problem-")) {
    return "problem";
  }
  if (normalizedType.includes("process studio") || normalizedId.includes("import-process-")) {
    return "process";
  }
  if (normalizedType.includes("solution studio") || normalizedId.includes("import-solution-")) {
    return "solution";
  }
  if (normalizedType.includes("implementation studio") || normalizedId.includes("import-implementation-")) {
    return "implementation";
  }

  return null;
};

const normalizeLayoutText = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const inferLayoutSlot = (block: PosterBlock, index: number) => {
  const blockId = normalizeLayoutText(block.id);
  const title = normalizeLayoutText(block.title);
  const type = normalizeLayoutText(block.type);
  const content = normalizeLayoutText(block.content.slice(0, 160));
  const combined = `${blockId} ${title} ${type} ${content}`;

  const has = (...terms: string[]) => terms.some((term) => combined.includes(term));

  if (has("problem statement", "problem tree", "how might we", "root cause", " root cause", " problem ")) {
    return "problem";
  }
  if (has("evidence", "statistic", "data point", "source", "research")) {
    return "evidence";
  }
  if (has("stakeholder", "system map", "system node")) {
    return "stakeholders";
  }
  if (has("population", "audience", "beneficiary", "target group", "persona")) {
    return "population";
  }
  if (has("journey", "user journey", "experience map")) {
    return "journey";
  }
  if (has("solution", "theory of change", "policy option", "recommendation")) {
    return "solution";
  }
  if (has("implementation", "action plan", "implementation plan")) {
    return "implementation";
  }
  if (has("risk", "barrier", "challenge", "mitigation")) {
    return "risks";
  }
  if (has("indicator", "metric", "dashboard", "measurement", "chart")) {
    return "indicators";
  }
  if (has("timeline", "milestone", "roadmap")) {
    return "timeline";
  }
  if (has("funding", "budget", "cost", "resource plan")) {
    return "funding";
  }
  if (has("partner", "collaboration", "coalition")) {
    return "partners";
  }

  return `extra-${index}`;
};

export default function PosterStudioPage() {
  const isAdminSession = useAdminSession();
  const { project, importObjects, appendAlert, updateStudioState } = useProject();
  const projectScopedStorageKey = getProjectStudioStorageKey(
    project.setup.projectNumber,
    POSTER_STORAGE_KEY
  );

  const [posterHeader, setPosterHeader] = useState<PosterHeader>(initialHeader);
  const [blocks, setBlocks] = useState<PosterBlock[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState("problem");
  const [selectedHeaderField, setSelectedHeaderField] =
    useState<keyof PosterHeader | null>(null);
  const [activeSideTab, setActiveSideTab] = useState<SideTab>("Elements");
  const [layoutSuggestions, setLayoutSuggestions] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [zoom, setZoom] = useState(0.58);
  const [savedStatus, setSavedStatus] = useState("Not saved yet");
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeName>("academic");
  const [posterSize, setPosterSize] = useState<PosterSize>("A0");
  const [orientation, setOrientation] = useState<Orientation>("landscape");
  const [isPreview, setIsPreview] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [selectedImports, setSelectedImports] = useState<Record<string, boolean>>(
    Object.fromEntries(importOptions.map(([key]) => [key, true]))
  );
  const [selectedElementImports, setSelectedElementImports] = useState<Record<string, boolean>>({});

  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const posterPaperRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const hydratedProjectKey = useRef("");
  const selectedBlock = blocks.find((block) => block.id === selectedBlockId);
  const currentTheme = themeMap[theme];

  useEffect(() => {
    const projectKey = project.setup.projectNumber.trim().toUpperCase();
    if (!projectKey || hydratedProjectKey.current === projectKey) return;

    const storedState = project.studioStates?.poster;

    if (storedState && typeof storedState === "object") {
      const parsed = storedState as {
        posterHeader?: PosterHeader;
        blocks?: PosterBlock[];
        theme?: ThemeName;
        posterSize?: PosterSize;
        orientation?: Orientation;
        savedAt?: string;
      };

      if (parsed.posterHeader) setPosterHeader(parsed.posterHeader);
      if (Array.isArray(parsed.blocks)) setBlocks(parsed.blocks);
      if (parsed.theme) setTheme(parsed.theme);
      if (parsed.posterSize) setPosterSize(parsed.posterSize);
      if (parsed.orientation) setOrientation(parsed.orientation);
      if (parsed.savedAt) {
        setLastSavedAt(parsed.savedAt);
        setSavedStatus("Loaded saved work");
      }

      hydratedProjectKey.current = projectKey;
      return;
    }

    try {
      if (!projectScopedStorageKey) {
        hydratedProjectKey.current = projectKey;
        return;
      }

      const raw = localStorage.getItem(projectScopedStorageKey);
      if (!raw) {
        setPosterHeader(initialHeader);
        setBlocks(initialBlocks);
        setSelectedBlockId("");
        setSelectedHeaderField(null);
        setTheme("academic");
        setPosterSize("A0");
        setOrientation("landscape");
        setLastSavedAt(null);
        setSavedStatus("Not saved yet");
        hydratedProjectKey.current = projectKey;
        return;
      }
      const parsed = JSON.parse(raw);
      if (parsed.posterHeader) setPosterHeader(parsed.posterHeader);
      if (Array.isArray(parsed.blocks)) setBlocks(parsed.blocks);
      if (parsed.theme) setTheme(parsed.theme);
      if (parsed.posterSize) setPosterSize(parsed.posterSize);
      if (parsed.orientation) setOrientation(parsed.orientation);
      if (parsed.savedAt) {
        setLastSavedAt(parsed.savedAt);
        setSavedStatus(`Loaded saved work`);
      }
      hydratedProjectKey.current = projectKey;
    } catch (error) {
      console.error(error);
      hydratedProjectKey.current = projectKey;
    }
  }, [project.setup.projectNumber, project.studioStates, projectScopedStorageKey]);

  const savePoster = (silent = false) => {
    const savedAt = new Date().toISOString();
    const posterState = {
      posterHeader,
      blocks,
      theme,
      posterSize,
      orientation,
      savedAt,
    };

    if (projectScopedStorageKey) {
      const savedLocally = trySetLocalStorageItem(
        projectScopedStorageKey,
        JSON.stringify(posterState)
      );

      if (!savedLocally && !silent) {
        setReviewText("Poster is too large for browser storage, so it was saved to the project database instead.");
      }
    }
    updateStudioState("poster", posterState);
    setLastSavedAt(savedAt);
    setSavedStatus(silent ? "Auto-saved" : "Progress saved");
  };

  useEffect(() => {
    const timer = window.setInterval(() => savePoster(true), AUTOSAVE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [posterHeader, blocks, theme, posterSize, orientation]);

  const completedCount = useMemo(
    () =>
      blocks.filter((block) => {
        const text = block.content.trim().toLowerCase();
        return text && !placeholderTexts.some((item) => text.startsWith(item));
      }).length,
    [blocks]
  );

  const progressPercent =
    blocks.length > 0
      ? Math.round((completedCount / blocks.length) * 100)
      : 0;

  const wordCount = useMemo(() => {
    const text = [posterHeader.title, posterHeader.subtitle, ...blocks.map((b) => b.content)].join(" ");
    return text.trim().split(/\s+/).filter(Boolean).length;
  }, [posterHeader, blocks]);

  const missingSections = useMemo(
    () =>
      blocks
        .filter((block) => {
          const text = block.content.trim().toLowerCase();
          return !text || placeholderTexts.some((item) => text.startsWith(item));
        })
        .map((block) => block.title),
    [blocks]
  );

  const updateHeader = (changes: Partial<PosterHeader>) => {
    setPosterHeader((prev) => ({ ...prev, ...changes }));
    setSavedStatus("Unsaved changes");
  };

  const updateBlock = (id: string, changes: Partial<PosterBlock>) => {
    setBlocks((prev) => prev.map((block) => (block.id === id ? { ...block, ...changes } : block)));
    setSavedStatus("Unsaved changes");
  };

  const scrollToHeader = (field: keyof PosterHeader = "title") => {
    setSelectedHeaderField(field);
    setSelectedBlockId("");
    setActiveSideTab("Text");
    workspaceRef.current?.scrollTo({ left: 0, top: 0, behavior: "smooth" });
  };

  const scrollToBlock = (block: PosterBlock) => {
    setSelectedHeaderField(null);
    setSelectedBlockId(block.id);
    workspaceRef.current?.scrollTo({
      left: Math.max(0, block.x * zoom - 60),
      top: Math.max(0, (block.y + 170) * zoom - 60),
      behavior: "smooth",
    });
  };

  const addVisualElement = (kind: PosterBlockKind) => {
    const id = `${kind}-${Date.now()}`;
    const topElementCount = blocks.filter((block) =>
      ["textbox", "callout", "divider", "shape"].includes(block.kind)
    ).length;
    const block: PosterBlock = {
      id,
      number: "+",
      title:
        kind === "textbox"
          ? "Text Box"
          : kind === "image"
          ? "Image"
          : kind === "chart"
          ? "Imported Chart"
          : kind === "icon"
          ? "Imported Icon"
          : kind === "shape"
          ? "Smart Art"
          : kind === "callout"
          ? "Callout"
          : "Divider",
      type:
        kind === "chart"
          ? "Imported from previous studio"
          : kind === "icon"
          ? "Imported from previous studio"
          : kind === "shape"
          ? "Smart Art"
          : "Visual Element",
      accent: currentTheme.accent,
      x: kind === "divider" ? 60 : 80 + (topElementCount % 2) * 460,
      y: 260 + Math.floor(topElementCount / 2) * 220,
      width: kind === "divider" ? 1200 : kind === "shape" ? 320 : 420,
      height: kind === "divider" ? 60 : kind === "callout" ? 200 : kind === "shape" ? 120 : 180,
      kind,
      shapeType: kind === "shape" ? "arrow" : undefined,
      content:
        kind === "textbox"
          ? "Add your text here."
          : kind === "image"
          ? "Image placeholder. Upload, paste, or drag an image here."
          : kind === "chart"
          ? "Imported chart content will appear here."
          : kind === "icon"
          ? "Imported icon or visual symbol will appear here."
          : kind === "shape"
          ? "Label"
          : kind === "callout"
          ? "Highlight an important point here."
          : "Section divider.",
    };
    setBlocks((prev) => [...prev, block]);
    setSelectedHeaderField(null);
    setSelectedBlockId(block.id);
    setSavedStatus("Unsaved changes");
    setTimeout(() => scrollToBlock(block), 50);
  };

  const addSmartArtElement = (shapeType: PosterShapeType) => {
    const topElementCount = blocks.filter((block) =>
      ["textbox", "callout", "divider", "shape"].includes(block.kind)
    ).length;
    const block: PosterBlock = {
      id: `shape-${shapeType}-${Date.now()}`,
      number: "+",
      title:
        shapeType === "arrow"
          ? "Arrow Right"
          : shapeType === "arrow-left"
          ? "Arrow Left"
          : shapeType === "arrow-up"
          ? "Arrow Up"
          : shapeType === "arrow-down"
          ? "Arrow Down"
          : shapeType === "line"
          ? "Line Horizontal"
          : shapeType === "line-vertical"
          ? "Line Vertical"
          : shapeType === "connector-elbow"
          ? "Elbow Connector"
          : shapeType === "connector-curve"
          ? "Curved Connector"
          : shapeType === "rectangle"
          ? "Rectangle"
          : shapeType === "circle"
          ? "Circle"
          : "Chevron",
      type: "Smart Art",
      content:
        shapeType === "line" || shapeType === "line-vertical" || shapeType === "connector-elbow" || shapeType === "connector-curve"
          ? ""
          : "Label",
      accent: currentTheme.accent,
      x: 80 + (topElementCount % 2) * 420,
      y: 240 + Math.floor(topElementCount / 2) * 180,
      width:
        shapeType === "line" || shapeType === "connector-elbow" || shapeType === "connector-curve"
          ? 360
          : shapeType === "line-vertical"
          ? 120
          : shapeType === "circle"
          ? 170
          : shapeType === "arrow-up" || shapeType === "arrow-down"
          ? 180
          : 300,
      height:
        shapeType === "line"
          ? 70
          : shapeType === "line-vertical"
          ? 220
          : shapeType === "connector-elbow"
          ? 180
          : shapeType === "connector-curve"
          ? 160
          : shapeType === "circle"
          ? 170
          : shapeType === "arrow-up" || shapeType === "arrow-down"
          ? 220
          : 120,
      kind: "shape",
      shapeType,
    };
    setBlocks((prev) => [...prev, block]);
    setSelectedHeaderField(null);
    setSelectedBlockId(block.id);
    setActiveSideTab("Visuals");
    setSavedStatus("Unsaved changes");
    setTimeout(() => scrollToBlock(block), 50);
  };

  const handleImageFile = (file: File, blockId: string) => {
    if (!file.type.startsWith("image/")) {
      setReviewText("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateBlock(blockId, {
        imageUrl: String(reader.result),
        content: "Image uploaded successfully.",
      });
      setActiveSideTab("Visuals");
    };
    reader.readAsDataURL(file);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, blockId: string) => {
    const file = event.target.files?.[0];
    if (file) handleImageFile(file, blockId);
    event.target.value = "";
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setReviewText("Please upload an image file for the poster logo.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") return;
      updateHeader({ logoImageUrl: reader.result });
      setSelectedHeaderField("logo");
      setActiveSideTab("Text");
      setSavedStatus("Unsaved changes");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleWorkspacePaste = async (event: React.ClipboardEvent<HTMLDivElement>) => {
    const imageItem = Array.from(event.clipboardData.items).find((item) => item.type.startsWith("image/"));
    if (!imageItem) return;
    const file = imageItem.getAsFile();
    if (!file) return;
    const imageBlock = selectedBlock?.kind === "image" ? selectedBlock : undefined;
    if (imageBlock) {
      handleImageFile(file, imageBlock.id);
    } else {
      const id = `image-${Date.now()}`;
      const newBlock: PosterBlock = {
        id,
        number: "+",
        title: "Image",
        type: "Pasted image",
        accent: currentTheme.accent,
        x: 80,
        y: 1380,
        width: 420,
        height: 240,
        kind: "image",
        content: "Image pasted successfully.",
      };
      setBlocks((prev) => [...prev, newBlock]);
      setSelectedBlockId(id);
      setSelectedHeaderField(null);
      setTimeout(() => handleImageFile(file, id), 0);
    }
    event.preventDefault();
  };

  const handleImageDrop = (event: React.DragEvent<HTMLDivElement>, blockId?: string) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;
    const targetBlockId = blockId || (selectedBlock?.kind === "image" ? selectedBlock.id : undefined);
    if (targetBlockId) {
      handleImageFile(file, targetBlockId);
    } else {
      addVisualElement("image");
    }
  };

  const duplicateSelectedBlock = () => {
    if (!selectedBlock) return;
    const duplicate: PosterBlock = {
      ...selectedBlock,
      id: `${selectedBlock.kind}-${Date.now()}`,
      title: `${selectedBlock.title} Copy`,
      x: selectedBlock.x + 40,
      y: selectedBlock.y + 40,
    };
    setBlocks((prev) => [...prev, duplicate]);
    setSelectedBlockId(duplicate.id);
    setSelectedHeaderField(null);
    setSavedStatus("Unsaved changes");
  };

  const deleteSelectedBlock = () => {
    if (!selectedBlock || selectedBlock.kind === "section") return;
    setBlocks((prev) => prev.filter((block) => block.id !== selectedBlock.id));
    setSelectedBlockId("problem");
    setSavedStatus("Unsaved changes");
  };

  const copySelectedContent = async () => {
    const text = (selectedHeaderField ? posterHeader[selectedHeaderField] : selectedBlock?.content) ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setSavedStatus("Copied");
    } catch {
      setReviewText("Copy failed. Please copy manually.");
    }
  };

  const pasteIntoSelected = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (selectedHeaderField) {
        updateHeader({ [selectedHeaderField]: text });
        return;
      }
      if (selectedBlock) updateBlock(selectedBlock.id, { content: text });
    } catch {
      setReviewText("Paste failed. Please paste manually into the editor.");
    }
  };

  const readPosterContent = () => {
    const importedObjects = readAllStudioObjectsFromProject(project);
    importObjects(importedObjects);
    return buildPosterContent(importedObjects);
  };

  const readPosterContentForSource = (
    source: "Problem/Evidence" | "Process" | "Solution" | "Implementation"
  ) => {
    const importedObjects = readAllStudioObjectsFromProject(project);
    importObjects(importedObjects);

    const studioId =
      source === "Problem/Evidence"
        ? "problem"
        : source === "Process"
        ? "process"
        : source === "Solution"
        ? "solution"
        : "implementation";

    return buildPosterContent(
      importedObjects.filter((object) => object.studioId === studioId)
    );
  };

  const buildImportedBlock = (
    key: string,
    label: string,
    content: string,
    index: number
  ): PosterBlock => {
    const kind: PosterBlockKind =
      key === "charts" || key === "indicators"
        ? "chart"
        : key === "icons"
        ? "icon"
        : "textbox";
    const accent = kind === "chart" ? "#2b5876" : kind === "icon" ? "#4e4376" : currentTheme.accent;

    return {
      id: `import-${key}-${Date.now()}-${index}`,
      number: "+",
      title: label,
      type: "Imported from previous studios",
      accent,
      x: 80 + (index % 2) * 500,
      y: 260 + Math.floor(index / 2) * 250,
      width: kind === "icon" ? 340 : 440,
      height: kind === "chart" ? 220 : 190,
      kind,
      content,
      imported: true,
    };
  };

  const projectObjectMatchesImport = (object: ProjectObject, key: string) => {
    const hasEmbeddedImage = object.embeddedVisuals?.some(
      (visual) => visual.imageDataUrl || visual.visualType === "image"
    );
    const hasEmbeddedChart = object.embeddedVisuals?.some(
      (visual) => visual.chartData?.length || visual.visualType === "chart"
    );

    if (key === "images") {
      return Boolean(object.imageDataUrl) || object.visualType === "image" || object.type === "image" || Boolean(hasEmbeddedImage);
    }

    if (key === "charts") {
      return Boolean(object.chartData?.length) || object.visualType === "chart" || object.type === "chart" || Boolean(hasEmbeddedChart);
    }

    if (key === "icons") {
      return object.visualType === "icon" || object.type === "icon";
    }

    return importTypeMap[key]?.includes(object.type) ?? false;
  };

  const buildImportedBlockFromObject = (
    object: ProjectObject,
    index: number
  ): PosterBlock => {
    const hasEmbeddedVisuals = Boolean(object.embeddedVisuals?.length);
    const kind: PosterBlockKind =
      hasEmbeddedVisuals
        ? "textbox"
        : object.imageDataUrl || object.visualType === "image" || object.type === "image"
        ? "image"
        : object.chartData?.length || object.visualType === "chart" || object.type === "chart"
        ? "chart"
        : object.visualType === "icon" || object.type === "icon"
        ? "icon"
        : "textbox";
    const accent = kind === "chart" ? "#2b5876" : kind === "icon" ? "#4e4376" : currentTheme.accent;

    return {
      id: `import-${object.studioId}-${object.id}-${Date.now()}-${index}`,
      number: "+",
      title: object.title,
      type: `Imported from ${object.studioId} studio`,
      accent,
      x: 80 + (index % 2) * 500,
      y: 260 + Math.floor(index / 2) * 250,
      width: clampPosterSize(object.width, kind === "icon" ? 340 : kind === "image" ? 420 : 440, 260, 620),
      height: clampPosterSize(object.height, kind === "chart" ? 240 : kind === "image" ? 260 : 190, 150, 420),
      kind,
      content: stripLeadingDefaultIcon(object.content || object.title),
      imageUrl: object.imageDataUrl,
      caption: kind === "image" ? object.content : undefined,
      altText: kind === "image" ? object.title : undefined,
      imported: true,
      sourceColor: object.color,
      icon: object.icon,
      chartType: object.chartType,
      chartData: object.chartData,
      embeddedVisuals: object.embeddedVisuals,
    };
  };

  const importSelectedFromStudios = () => {
    const importedObjects = readAllStudioObjectsFromProject(project);
    importObjects(importedObjects);
    const posterContent = buildPosterContent(importedObjects);
    const smartContent: Record<string, string | undefined> = {
      ...posterContent,
      journey: posterContent.population,
      timeline: posterContent.implementation,
      charts: posterContent.indicators || posterContent.evidence,
      personas: posterContent.personas || posterContent.population,
    };

    const selectedKeys = importOptions
      .filter(([key]) => selectedImports[key])
      .map(([key]) => key);
    const seenObjects = new Set<string>();
    const richImportedBlocks = importedObjects
      .filter((object) => {
        const matched = selectedKeys.some((key) => projectObjectMatchesImport(object, key));
        const objectKey = getProjectObjectImportKey(object);
        if (!matched || seenObjects.has(objectKey)) return false;
        seenObjects.add(objectKey);
        return true;
      })
      .map((object, index) => buildImportedBlockFromObject(object, index));
    const fallbackBlocks = importOptions
      .filter(([key]) => selectedImports[key])
      .filter(([key]) => !richImportedBlocks.some((block) => projectObjectMatchesImport({
        id: block.id,
        title: block.title,
        type: block.kind,
        content: block.content,
        studioId: "poster",
        imageDataUrl: block.imageUrl,
        visualType: block.kind === "image" || block.kind === "chart" || block.kind === "icon" ? block.kind : undefined,
        icon: block.icon,
        chartData: block.chartData,
      }, key)))
      .map(([key, label], index) =>
        buildImportedBlock(
          key,
          label,
          smartContent[key] ||
            `No saved ${label.toLowerCase()} content was found in the previous studios.`,
          richImportedBlocks.length + index
        )
      );
    const importedBlocks = richImportedBlocks.length ? richImportedBlocks : fallbackBlocks;

    setBlocks((prev) => [...prev, ...importedBlocks]);
    const firstImportedBlock = importedBlocks[0];

    if (firstImportedBlock) {
      setSelectedBlockId(firstImportedBlock.id);
      setSelectedHeaderField(null);
      setActiveSideTab("Text");
      setTimeout(() => scrollToBlock(firstImportedBlock), 50);
    }

    setReviewText(
      importedBlocks.length
        ? `${importedBlocks.length} item${importedBlocks.length === 1 ? "" : "s"} imported from previous studios.`
        : "Choose at least one import option."
    );
    setSavedStatus("Unsaved changes");
  };

  const importCheckedStudioElements = () => {
    const studioObjects = readAllStudioObjectsFromProject(project);
    const seenObjects = new Set<string>();
    const selectedObjects = studioObjects.filter((object) => {
      const selected = Boolean(selectedElementImports[getElementSelectionKey(object)]);
      const objectKey = getProjectObjectImportKey(object);

      if (!selected || seenObjects.has(objectKey)) return false;
      seenObjects.add(objectKey);
      return true;
    });
    const importedBlocks = selectedObjects.map((object, index) =>
      buildImportedBlockFromObject(object, index)
    );
    const firstImportedBlock = importedBlocks[0];

    if (!importedBlocks.length) {
      setReviewText("Select at least one saved element to import.");
      return;
    }

    importObjects(selectedObjects);
    setBlocks((prev) => [...prev, ...importedBlocks]);

    if (firstImportedBlock) {
      setSelectedBlockId(firstImportedBlock.id);
      setSelectedHeaderField(null);
      setActiveSideTab("Text");
      setTimeout(() => scrollToBlock(firstImportedBlock), 50);
    }

    setSelectedElementImports({});
    setReviewText(
      `${importedBlocks.length} selected element${importedBlocks.length === 1 ? "" : "s"} imported from previous studios.`
    );
    setSavedStatus("Unsaved changes");
  };

  const importChartFromStudios = (source: "Problem/Evidence" | "Process" | "Solution" | "Implementation") => {
    const seenObjects = new Set<string>();
    const sourceObjects = readAllStudioObjectsFromProject(project).filter((object) => {
      const studioId =
        source === "Problem/Evidence"
          ? "problem"
          : source === "Process"
          ? "process"
          : source === "Solution"
          ? "solution"
          : "implementation";

      const objectKey = getProjectObjectImportKey(object);
      if (object.studioId !== studioId || !projectObjectMatchesImport(object, "charts") || seenObjects.has(objectKey)) {
        return false;
      }
      seenObjects.add(objectKey);
      return true;
    });

    importObjects(sourceObjects);

    const importedVisualCount = blocks.filter(
      (block) => block.kind === "chart" || block.kind === "icon" || block.kind === "image"
    ).length;

    if (sourceObjects.length) {
      const chartBlocks = sourceObjects.map((object, index) =>
        buildImportedBlockFromObject(object, importedVisualCount + index)
      );
      const firstChartBlock = chartBlocks[0];

      setBlocks((prev) => [...prev, ...chartBlocks]);
      setSelectedBlockId(firstChartBlock.id);
      setSelectedHeaderField(null);
      setSavedStatus("Unsaved changes");
      setReviewText(`${chartBlocks.length} chart${chartBlocks.length === 1 ? "" : "s"} imported from ${source}.`);
      setTimeout(() => scrollToBlock(firstChartBlock), 50);
      return;
    }

    const posterContent = readPosterContentForSource(source);

    const contentMap: Record<typeof source, string | undefined> = {
      "Problem/Evidence": posterContent.evidence || posterContent.problem,
      Process: posterContent.stakeholders || posterContent.population,
      Solution: posterContent.solution,
      Implementation: posterContent.implementation || posterContent.indicators,
    };

    const content =
      contentMap[source] ||
      `No finalized chart-ready content was found from ${source}. Add chart notes here after reviewing that studio.`;

    const chartBlock: PosterBlock = {
      id: `chart-${Date.now()}`,
      number: "+",
      title: `${source} Chart`,
      type: `Imported from ${source} Studio`,
      accent: "#2b5876",
      x: 80 + (importedVisualCount % 2) * 500,
      y: 260 + Math.floor(importedVisualCount / 2) * 250,
      width: 440,
      height: 220,
      kind: "chart",
      content,
      imported: true,
    };

    setBlocks((prev) => [...prev, chartBlock]);
    setSelectedBlockId(chartBlock.id);
    setSelectedHeaderField(null);
    setSavedStatus("Unsaved changes");
    setReviewText(`Chart imported from ${source} studio content.`);
    setTimeout(() => scrollToBlock(chartBlock), 50);
  };

  const importIconFromStudios = (source: "Problem/Evidence" | "Process" | "Solution" | "Implementation") => {
    const seenObjects = new Set<string>();
    const sourceObjects = readAllStudioObjectsFromProject(project).filter((object) => {
      const studioId =
        source === "Problem/Evidence"
          ? "problem"
          : source === "Process"
          ? "process"
          : source === "Solution"
          ? "solution"
          : "implementation";

      const objectKey = getProjectObjectImportKey(object);
      if (object.studioId !== studioId || !projectObjectMatchesImport(object, "icons") || seenObjects.has(objectKey)) {
        return false;
      }
      seenObjects.add(objectKey);
      return true;
    });

    importObjects(sourceObjects);

    const importedVisualCount = blocks.filter(
      (block) => block.kind === "chart" || block.kind === "icon" || block.kind === "image"
    ).length;

    if (sourceObjects.length) {
      const iconBlocks = sourceObjects.map((object, index) =>
        buildImportedBlockFromObject(object, importedVisualCount + index)
      );
      const firstIconBlock = iconBlocks[0];

      setBlocks((prev) => [...prev, ...iconBlocks]);
      setSelectedBlockId(firstIconBlock.id);
      setSelectedHeaderField(null);
      setSavedStatus("Unsaved changes");
      setReviewText(`${iconBlocks.length} icon${iconBlocks.length === 1 ? "" : "s"} imported from ${source}.`);
      setTimeout(() => scrollToBlock(firstIconBlock), 50);
      return;
    }

    const posterContent = readPosterContentForSource(source);

    const contentMap: Record<typeof source, string | undefined> = {
      "Problem/Evidence": posterContent.problem || posterContent.evidence,
      Process: posterContent.stakeholders || posterContent.population,
      Solution: posterContent.solution,
      Implementation: posterContent.implementation || posterContent.indicators,
    };

    const content =
      contentMap[source] ||
      `No finalized icon-related content was found from ${source}. Add a short icon label here.`;

    const iconBlock: PosterBlock = {
      id: `icon-${Date.now()}`,
      number: "+",
      title: `${source} Icon`,
      type: `Imported from ${source} Studio`,
      accent: "#4e4376",
      x: 80 + (importedVisualCount % 2) * 500,
      y: 260 + Math.floor(importedVisualCount / 2) * 250,
      width: 340,
      height: 180,
      kind: "icon",
      content,
      imported: true,
    };

    setBlocks((prev) => [...prev, iconBlock]);
    setSelectedBlockId(iconBlock.id);
    setSelectedHeaderField(null);
    setSavedStatus("Unsaved changes");
    setReviewText(`Icon imported from ${source} studio content.`);
    setTimeout(() => scrollToBlock(iconBlock), 50);
  };

  const applyPosterLayout = (layout: LayoutName) => {
    const gap = 18;
    const inset = 24;
    const currentPosterDimensions = { width: posterWidth, height: posterHeight };

    setBlocks((prev) => {
      const importedByStudio = new Map<Exclude<ProjectStudioId, "poster">, PosterBlock[]>(
        orderedStudioIds.map((studioId) => [studioId, []])
      );
      const remainingBlocks: PosterBlock[] = [];

      prev.forEach((block) => {
        const studioId = getImportedStudioId(block);
        if (studioId) {
          importedByStudio.get(studioId)?.push(block);
          return;
        }
        remainingBlocks.push(block);
      });

      let cursorX = inset;
      let cursorY = inset;
      let rowHeight = 0;

      const packSequentially = (items: PosterBlock[]) =>
        items.map((block) => {
          const targetWidth = clampPosterSize(
            block.width,
            block.kind === "shape" ? 240 : block.kind === "icon" ? 260 : block.kind === "chart" ? 340 : 320,
            block.kind === "shape" ? 120 : 180,
            Math.max(220, posterWidth - inset * 2)
          );
          const targetHeight = clampPosterSize(
            block.height,
            block.kind === "shape" ? 120 : block.kind === "chart" ? 210 : 180,
            70,
            Math.max(120, posterHeight - inset * 2)
          );

          if (cursorX + targetWidth > posterWidth - inset && cursorX > inset) {
            cursorX = inset;
            cursorY += rowHeight + gap;
            rowHeight = 0;
          }

          const placed = fitFrameWithinPoster(
            {
              x: cursorX,
              y: cursorY,
              width: targetWidth,
              height: targetHeight,
            },
            currentPosterDimensions,
            inset
          );

          cursorX = placed.x + placed.width + gap;
          rowHeight = Math.max(rowHeight, placed.height);

          return {
            ...block,
            ...placed,
          };
        });

      const positionedImportedIds = new Set<string>();
      const positionedImportedBlocks = orderedStudioIds.flatMap((studioId) => {
        const items = importedByStudio.get(studioId) ?? [];
        const packed = packSequentially(items);
        packed.forEach((item) => positionedImportedIds.add(item.id));
        return packed;
      });

      const fittedRemainingBlocks = remainingBlocks.map((block) => ({
        ...block,
        ...fitFrameWithinPoster(
          {
            x: block.x,
            y: block.y,
            width: block.width,
            height: block.height,
          },
          currentPosterDimensions
        ),
      }));

      const positionedImportedMap = new Map(positionedImportedBlocks.map((block) => [block.id, block]));

      return prev.map((block) => {
        if (positionedImportedIds.has(block.id)) {
          return positionedImportedMap.get(block.id) ?? block;
        }

        return fittedRemainingBlocks.find((item) => item.id === block.id) ?? block;
      });
    });
    setReviewText("Applied sequential layout in studio order without overlap.");
    setSavedStatus("Unsaved changes");
  };

  const generateLayouts = () => {
    setLayoutSuggestions(["Sequential Studio Layout"]);
    setActiveSideTab("Layout");
  };

  const reviewPoster = () => {
    const issues = [];
    if (missingSections.length) issues.push(`Missing/placeholder sections: ${missingSections.join(", ")}.`);
    if (!blocks.some((b) => b.kind === "image" && b.imageUrl)) issues.push("Consider adding at least one relevant image or visual.");
    if (wordCount > 700) issues.push("Text may be too long for a conference poster.");
    if (!issues.length) issues.push("Poster looks close to export-ready. Review citations and visual balance before final export.");
    setReviewText(issues.join(" "));
    setActiveSideTab("Coach");
  };

  const resetPosterLayout = () => {
    setPosterHeader(initialHeader);
    setBlocks(initialBlocks);
    setSelectedBlockId("problem");
    setSelectedHeaderField(null);
    if (projectScopedStorageKey) {
      localStorage.removeItem(projectScopedStorageKey);
    }
    setSavedStatus("Layout reset");
  };

  const updateTheme = (nextTheme: ThemeName) => {
    const selected = themeMap[nextTheme];
    setTheme(nextTheme);
    setBlocks((prev) => prev.map((block) => ({ ...block, accent: block.kind === "section" ? block.accent : selected.accent })));
    setSavedStatus("Unsaved changes");
  };

  const renderLeftPanel = () => {
    if (activeSideTab === "Elements") {
      const studioObjects = readAllStudioObjectsFromProject(project);
      const selectedElementCount = studioObjects.filter((object) =>
        Boolean(selectedElementImports[getElementSelectionKey(object)])
      ).length;

      return (
        <>
          <h2>Elements</h2>
          <p className="fieldNote">Select saved elements from previous studios and import them into the poster workspace.</p>
          <div className={styles.elementImportList}>
            {sourceStudios.map(([studioId, studioName]) => {
              const objects = studioObjects.filter((object) => object.studioId === studioId);

              return (
                <section key={studioId} className={styles.elementStudioGroup}>
                  <h3>{studioName}</h3>
                  {objects.length ? (
                    <div className={styles.elementCheckboxList}>
                      {objects.map((object) => {
                        const key = getElementSelectionKey(object);
                        const hasVisual =
                          Boolean(object.imageDataUrl) ||
                          Boolean(object.chartData?.length) ||
                          Boolean(object.icon) ||
                          Boolean(object.embeddedVisuals?.length);

                        return (
                          <label key={key} className={styles.elementCheckboxRow}>
                            <input
                              type="checkbox"
                              checked={Boolean(selectedElementImports[key])}
                              onChange={(event) =>
                                setSelectedElementImports((prev) => ({
                                  ...prev,
                                  [key]: event.target.checked,
                                }))
                              }
                            />
                            <span>
                              <strong>{object.title}</strong>
                              <small>{object.type}{hasVisual ? " · includes visual" : ""}</small>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <p className={styles.emptyElementMessage}>No saved elements yet.</p>
                  )}
                </section>
              );
            })}
          </div>
          <button type="button" className={`button ${styles.elementImportButton}`} onClick={importCheckedStudioElements}>
            Import Selected Elements{selectedElementCount ? ` (${selectedElementCount})` : ""}
          </button>
        </>
      );
    }

    if (activeSideTab === "Text") {
      return (
        <>
          <h2>Text Tools</h2>
          <p className="fieldNote">Add supporting text elements to the poster.</p>
          <div className={styles.toolList}>
            <button type="button" className={styles.toolCardButton} onClick={() => addVisualElement("textbox")}><strong>+ Text Box</strong><span>Editable text block</span></button>
            <button type="button" className={styles.toolCardButton} onClick={() => addVisualElement("callout")}><strong>+ Callout</strong><span>Highlight a key point</span></button>
            <button type="button" className={styles.toolCardButton} onClick={() => addVisualElement("divider")}><strong>+ Divider</strong><span>Add a section divider</span></button>
          </div>
          {selectedHeaderField ? renderHeaderEditor() : null}
          {selectedBlock && selectedBlock.kind !== "image" ? renderElementEditor() : null}
        </>
      );
    }

    if (activeSideTab === "Smart Art") {
      return (
        <>
          <h2>Smart Art</h2>
          <p className="fieldNote">Insert diagram-style shapes, arrows, and connectors directly into the poster workspace.</p>
          <div className={styles.smartArtGroupList}>
            {smartArtGroups.map((group) => (
              <section key={group.title} className={styles.smartArtGroup}>
                <h3 className={styles.panelSubheading}>{group.title}</h3>
                <div className={styles.smartArtIconRow}>
                  {group.items.map((shapeType) => {
                    const option = smartArtOptions.find((item) => item.shapeType === shapeType);
                    if (!option) return null;

                    return (
                      <button
                        key={shapeType}
                        type="button"
                        className={styles.smartArtIconButton}
                        title={option.label}
                        aria-label={option.label}
                        onClick={() => addSmartArtElement(shapeType)}
                      >
                        {renderSmartArtPickerIcon(shapeType)}
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
          {selectedBlock?.kind === "shape" ? renderImageEditor() : null}
        </>
      );
    }

    if (activeSideTab === "Visuals") {
      return (
        <>
          <h2>Visuals</h2>
          <p className="fieldNote">Upload images and adjust the styling of the selected visual element.</p>
          <div className={styles.toolList}>
            <button type="button" className={styles.toolCardButton} onClick={() => addVisualElement("image")}><strong>+ Image</strong><span>Upload, paste, or drag-drop</span></button>
          </div>

          {selectedBlock && ["image", "chart", "icon", "shape"].includes(selectedBlock.kind) ? renderImageEditor() : null}
        </>
      );
    }

    if (activeSideTab === "Layout") {
      const generated = layoutSuggestions.length ? layoutSuggestions : ["Sequential Studio Layout"];
      return (
        <>
          <h2>Poster Layouts</h2>
          <p className="fieldNote">Apply one sequential layout that places imported cards in studio order without overlap.</p>
          <button type="button" className="button" onClick={generateLayouts}>Show Layout</button>
          <div className={styles.toolList}>
            {generated.map((layout) => {
              const layoutType: LayoutName = "sequence";
              return <button key={layout} type="button" className={styles.toolCardButton} onClick={() => applyPosterLayout(layoutType)}><strong>{layout}</strong><span>Apply</span></button>;
            })}
          </div>
        </>
      );
    }

    if (activeSideTab === "Theme") {
      return (
        <>
          <h2>Theme</h2>
          <p className="fieldNote">Theme controls change poster colors and export setup.</p>
          <div className={styles.compactGrid}>
            {(Object.keys(themeMap) as ThemeName[]).map((item) => (
              <button key={item} type="button" className={`${styles.pillButton} ${theme === item ? styles.pillActive : ""}`} onClick={() => updateTheme(item)}>{themeMap[item].label}</button>
            ))}
          </div>
          <h3>Poster Size</h3>
          <div className={styles.compactGrid}>
            {(["A0", "A1", "A2"] as PosterSize[]).map((size) => <button key={size} type="button" className={`${styles.pillButton} ${posterSize === size ? styles.pillActive : ""}`} onClick={() => resizePosterCanvas(size, orientation)}>{size}</button>)}
          </div>
          <h3>Orientation</h3>
          <div className={styles.compactGrid}>
            {(["landscape", "portrait"] as Orientation[]).map((item) => <button key={item} type="button" className={`${styles.pillButton} ${orientation === item ? styles.pillActive : ""}`} onClick={() => resizePosterCanvas(posterSize, item)}>{item}</button>)}
          </div>
        </>
      );
    }

    if (activeSideTab === "Import") {
      return (
        <>
          <h2>Import</h2>
          <p className="fieldNote">Choose what to bring from previous studios.</p>
          <div className={styles.checkboxList}>
            {importOptions.map(([key, label]) => (
              <label key={key} className={styles.checkboxRow}>
                <input type="checkbox" checked={Boolean(selectedImports[key])} onChange={(event) => setSelectedImports((prev) => ({ ...prev, [key]: event.target.checked }))} />
                <span>{label}</span>
              </label>
            ))}
          </div>
          <button type="button" className="button" onClick={importSelectedFromStudios}>Import Selected</button>
        </>
      );
    }

    return (
      <>
        <h2>Poster Coach</h2>
        <p className="fieldNote">Review quality, progress, accessibility, citations, and export readiness.</p>
        <button type="button" className="button" onClick={reviewPoster}>Review Poster</button>
        <div className={styles.coachCard}><strong>Progress Report</strong><span>{completedCount}/{blocks.length} sections complete ({progressPercent}%).</span></div>
        <div className={styles.coachCard}><strong>Poster Checklist</strong><span>Problem, evidence, solution, implementation, indicators, partners.</span></div>
        <div className={styles.coachCard}><strong>Submission Checklist</strong><span>Title, team, course, sources, image captions, export-ready layout.</span></div>
        <div className={styles.coachCard}><strong>Conference Tips</strong><span>Use short text, strong headings, clear visuals, and visible recommendations.</span></div>
        <div className={styles.coachCard}><strong>Accessibility Check</strong><span>Alt text for images, high contrast, readable font sizes.</span></div>
        <div className={styles.coachCard}><strong>Citation Check</strong><span>Name data sources and avoid unsupported claims.</span></div>
        <div className={styles.coachCard}><strong>Word Count</strong><span>{wordCount} words.</span></div>
        <div className={styles.coachCard}><strong>Export Readiness</strong><span>{missingSections.length ? `Review: ${missingSections.join(", ")}` : "Ready for preview/export check."}</span></div>
        {reviewText ? <div className={styles.reviewBox}><strong>AI Review</strong><span>{reviewText}</span></div> : null}
      </>
    );
  };

  function renderHeaderEditor() {
    return (
      <div className={styles.editorBox}>
        <h3>Title Bar Editor</h3>
        <label className="fieldLabel"><span>Title</span><textarea rows={3} value={posterHeader.title} onChange={(event) => updateHeader({ title: event.target.value })} /></label>
        <label className="fieldLabel"><span>Subtitle</span><textarea rows={3} value={posterHeader.subtitle} onChange={(event) => updateHeader({ subtitle: event.target.value })} /></label>
        <label className="fieldLabel"><span>Logo / Mark</span><input value={posterHeader.logo} onChange={(event) => updateHeader({ logo: event.target.value })} /></label>
        <div className={styles.twoButtonRow}>
          <label className="button secondaryButton">
            {posterHeader.logoImageUrl ? "Replace Logo Image" : "Upload Logo Image"}
            <input type="file" accept="image/*" hidden onChange={handleLogoUpload} />
          </label>
          <button type="button" className="button secondaryButton" disabled={!posterHeader.logoImageUrl} onClick={() => updateHeader({ logoImageUrl: undefined })}>
            Remove Logo
          </button>
        </div>
        <label className="fieldLabel"><span>Team</span><input value={posterHeader.team} onChange={(event) => updateHeader({ team: event.target.value })} /></label>
        <label className="fieldLabel"><span>Course</span><input value={posterHeader.course} onChange={(event) => updateHeader({ course: event.target.value })} /></label>
        <label className="fieldLabel"><span>Instructor</span><input value={posterHeader.instructor} onChange={(event) => updateHeader({ instructor: event.target.value })} /></label>
      </div>
    );
  }

  function renderElementEditor() {
    if (!selectedBlock) return null;
    return (
      <div className={styles.editorBox}>
        <h3>Element Editor</h3>
        <label className="fieldLabel"><span>Title</span><input value={selectedBlock.title} onChange={(event) => updateBlock(selectedBlock.id, { title: event.target.value })} /></label>
        <label className="fieldLabel"><span>Type / Caption</span><input value={selectedBlock.type} onChange={(event) => updateBlock(selectedBlock.id, { type: event.target.value })} /></label>
        <label className="fieldLabel">
          <span>Card Color</span>
          <input type="color" value={selectedBlock.sourceColor || "#ffffff"} onChange={(event) => updateBlock(selectedBlock.id, { sourceColor: event.target.value })} />
        </label>
        <label className="fieldLabel">
          <span>Border Color</span>
          <input type="color" value={selectedBlock.borderColor || selectedBlock.accent || "#1e3a5f"} onChange={(event) => updateBlock(selectedBlock.id, { borderColor: event.target.value })} />
        </label>
        <label className="fieldLabel"><span>Content</span><textarea rows={6} value={selectedBlock.content} onChange={(event) => updateBlock(selectedBlock.id, { content: event.target.value })} /></label>
        <button type="button" className="button secondaryButton" onClick={duplicateSelectedBlock}>Duplicate</button>
        <button type="button" className="button secondaryButton" disabled={selectedBlock.kind === "section"} onClick={deleteSelectedBlock}>Delete</button>
      </div>
    );
  }

  function renderImageEditor() {
    if (!selectedBlock || !["image", "chart", "icon", "shape"].includes(selectedBlock.kind)) return null;
    return (
      <div className={styles.editorBox}>
        <h3>{selectedBlock.kind === "image" ? "Image Tools" : selectedBlock.kind === "shape" ? "Smart Art Tools" : "Visual Tools"}</h3>
        {selectedBlock.kind === "image" ? (
          <>
            <label className="button secondaryButton">
              {selectedBlock.imageUrl ? "Replace Image" : "Upload Image"}
              <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(event) => handleImageUpload(event, selectedBlock.id)} />
            </label>
            {selectedBlock.imageUrl ? <button type="button" className="button secondaryButton" onClick={() => updateBlock(selectedBlock.id, { imageUrl: undefined, content: "Image placeholder. Upload, paste, or drag an image here." })}>Remove Image</button> : null}
            <label className="fieldLabel"><span>Caption</span><textarea rows={3} value={selectedBlock.caption || ""} onChange={(event) => updateBlock(selectedBlock.id, { caption: event.target.value })} /></label>
            <label className="fieldLabel"><span>Alt Text</span><textarea rows={3} value={selectedBlock.altText || ""} onChange={(event) => updateBlock(selectedBlock.id, { altText: event.target.value })} /></label>
            <label className="fieldLabel"><span>Style</span><select value={selectedBlock.borderStyle || "none"} onChange={(event) => updateBlock(selectedBlock.id, { borderStyle: event.target.value as PosterBlock["borderStyle"] })}><option value="none">None</option><option value="rounded">Rounded</option><option value="shadow">Shadow</option><option value="frame">Frame</option></select></label>
          </>
        ) : null}
        {selectedBlock.kind === "shape" ? (
          <label className="fieldLabel">
            <span>Shape</span>
            <select
              value={selectedBlock.shapeType || "arrow"}
              onChange={(event) =>
                updateBlock(selectedBlock.id, {
                  shapeType: event.target.value as PosterShapeType,
                })
              }
            >
              {smartArtOptions.map((option) => (
                <option key={option.shapeType} value={option.shapeType}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="fieldLabel">
          <span>Accent Color</span>
          <input type="color" value={selectedBlock.accent} onChange={(event) => updateBlock(selectedBlock.id, { accent: event.target.value })} />
        </label>
        <label className="fieldLabel">
          <span>Background Color</span>
          <input type="color" value={selectedBlock.sourceColor || "#ffffff"} onChange={(event) => updateBlock(selectedBlock.id, { sourceColor: event.target.value })} />
        </label>
        <label className="fieldLabel">
          <span>Text Color</span>
          <input type="color" value={selectedBlock.textColor || currentTheme.text} onChange={(event) => updateBlock(selectedBlock.id, { textColor: event.target.value })} />
        </label>
        <label className="fieldLabel"><span>Title</span><input value={selectedBlock.title} onChange={(event) => updateBlock(selectedBlock.id, { title: event.target.value })} /></label>
        <label className="fieldLabel"><span>Description</span><textarea rows={4} value={selectedBlock.content} onChange={(event) => updateBlock(selectedBlock.id, { content: event.target.value })} /></label>
        <div className={styles.twoButtonRow}>
          <button type="button" className="button secondaryButton" onClick={duplicateSelectedBlock}>Duplicate</button>
          <button type="button" className="button secondaryButton" onClick={deleteSelectedBlock}>Delete</button>
        </div>
      </div>
    );
  }

  const startBlockDrag = (event: React.PointerEvent<HTMLElement>, block: PosterBlock) => {
    const target = event.target as HTMLElement;

    if (target.closest("button") || target.closest("input") || target.closest("textarea") || target.closest("select") || target.closest("label")) {
      return;
    }

    event.preventDefault();
    setSelectedHeaderField(null);
    setSelectedBlockId(block.id);

    if (isImportedBlock(block)) {
      setActiveSideTab("Text");
    } else if (block.kind === "image" || block.kind === "chart" || block.kind === "icon" || block.kind === "shape") {
      setActiveSideTab("Visuals");
    } else {
      setActiveSideTab("Text");
    }

    const startX = event.clientX;
    const startY = event.clientY;
    const originalX = block.x;
    const originalY = block.y;

    const onMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;

      updateBlock(block.id, {
        x: Math.max(0, Math.round((originalX + dx) / 10) * 10),
        y: Math.max(0, Math.round((originalY + dy) / 10) * 10),
      });
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setSavedStatus("Unsaved changes");
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const startBlockResize = (
    event: React.PointerEvent<HTMLElement>,
    block: PosterBlock,
    direction: "right" | "bottom" | "corner"
  ) => {
    event.stopPropagation();
    event.preventDefault();

    setSelectedHeaderField(null);
    setSelectedBlockId(block.id);

    const startX = event.clientX;
    const startY = event.clientY;
    const originalWidth = block.width;
    const originalHeight = block.height;
    const minWidth = block.kind === "icon" ? 180 : block.kind === "shape" ? 120 : 220;
    const minHeight =
      block.kind === "divider" ? 40 : block.kind === "shape" ? 60 : block.kind === "icon" ? 130 : 150;

    const onMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;

      updateBlock(block.id, {
        width:
          direction === "bottom"
            ? originalWidth
            : Math.max(minWidth, Math.round((originalWidth + dx) / 10) * 10),
        height:
          direction === "right"
            ? originalHeight
            : Math.max(minHeight, Math.round((originalHeight + dy) / 10) * 10),
      });
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      setSavedStatus("Unsaved changes");
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const renderPosterChart = (block: PosterBlock, imported: boolean) => {
    const data = block.chartData ?? [];
    const maxValue = Math.max(...data.map((row) => row.value), 1);
    const chartTextColor = block.textColor || currentTheme.text;

    if (!data.length) {
      return (
        <>
          <strong style={{ color: chartTextColor }}>{imported ? "Imported Chart" : "Chart"}</strong>
          <span style={{ color: chartTextColor }}>{block.content}</span>
        </>
      );
    }

    if (block.chartType === "line" || block.chartType === "scatter") {
      const points = data
        .map((row, index) => {
          const x = 36 + (index / Math.max(data.length - 1, 1)) * 348;
          const y = 150 - (row.value / maxValue) * 118;
          return `${x},${y}`;
        })
        .join(" ");

      return (
        <>
          <strong style={{ color: chartTextColor }}>{block.title}</strong>
          <svg className={styles.posterChartSvg} viewBox="0 0 420 180" role="img" aria-label={block.title}>
            <line x1="30" y1="155" x2="390" y2="155" stroke="#cbd5e1" strokeWidth="2" />
            <line x1="32" y1="28" x2="32" y2="155" stroke="#cbd5e1" strokeWidth="2" />
            <polyline points={points} fill="none" stroke={block.accent} strokeWidth="4" />
            {data.map((row, index) => {
              const x = 36 + (index / Math.max(data.length - 1, 1)) * 348;
              const y = 150 - (row.value / maxValue) * 118;

              return (
                <g key={`${row.label}-${index}`}>
                  <circle cx={x} cy={y} r="5" fill={block.accent} />
                  <text x={x} y="172" fontSize="10" textAnchor="middle" fill={chartTextColor}>
                    {row.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </>
      );
    }

    return (
      <>
        <strong style={{ color: chartTextColor }}>{block.title}</strong>
        <div className={styles.posterChartBars}>
          {data.map((row) => (
            <div key={row.label} className={styles.posterChartRow}>
              <div className={styles.posterChartLabel} style={{ color: chartTextColor }}>
                <span>{row.label}</span>
                <strong>{row.value.toLocaleString()}</strong>
              </div>
              <div className={styles.posterChartTrack}>
                <i style={{ width: `${(row.value / maxValue) * 100}%`, background: block.accent }} />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  const renderEmbeddedChart = (
    visual: NonNullable<PosterBlock["embeddedVisuals"]>[number],
    title: string
  ) => {
    const data = visual.chartData ?? [];
    const maxValue = Math.max(...data.map((row) => row.value), 1);

    if (!data.length) return null;

    if (visual.chartType === "line" || visual.chartType === "scatter") {
      const points = data
        .map((row, index) => {
          const x = 36 + (index / Math.max(data.length - 1, 1)) * 348;
          const y = 150 - (row.value / maxValue) * 118;
          return `${x},${y}`;
        })
        .join(" ");

      return (
        <svg className={styles.posterChartSvg} viewBox="0 0 420 180" role="img" aria-label={title}>
          <line x1="30" y1="155" x2="390" y2="155" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="32" y1="28" x2="32" y2="155" stroke="#cbd5e1" strokeWidth="2" />
          <polyline points={points} fill="none" stroke="#0f2f66" strokeWidth="4" />
          {data.map((row, index) => {
            const x = 36 + (index / Math.max(data.length - 1, 1)) * 348;
            const y = 150 - (row.value / maxValue) * 118;

            return (
              <g key={`${row.label}-${index}`}>
                <circle cx={x} cy={y} r="5" fill="#0f2f66" />
                <text x={x} y="172" fontSize="10" textAnchor="middle" fill="#334155">
                  {row.label}
                </text>
              </g>
            );
          })}
        </svg>
      );
    }

    return (
      <div className={styles.posterChartBars}>
        {data.map((row) => (
          <div key={row.label} className={styles.posterChartRow}>
            <div className={styles.posterChartLabel}>
              <span>{row.label}</span>
              <strong>{row.value.toLocaleString()}</strong>
            </div>
            <div className={styles.posterChartTrack}>
              <i style={{ width: `${(row.value / maxValue) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEmbeddedVisualCard = (block: PosterBlock) => {
    const visuals = block.embeddedVisuals ?? [];

    if (!visuals.length) return null;

    return (
      <div className={styles.embeddedVisualList}>
        {visuals.map((visual) => (
          <div key={visual.id} className={styles.embeddedVisualPreview}>
            {visual.imageDataUrl ? (
              <img src={visual.imageDataUrl} alt={block.altText || block.title} />
            ) : (
              renderEmbeddedChart(visual, block.title)
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSmartArt = (block: PosterBlock) => {
    const shapeType = block.shapeType || "arrow";
    const label = block.content.trim();
    const smartArtTextColor = block.textColor || block.accent;
    const filledShapeTextColor = block.textColor || "#ffffff";
    const shapeFillColor = block.sourceColor || block.accent;
    const outlinedShapeFillColor = block.sourceColor || "rgba(255, 255, 255, 0.72)";

    if (shapeType === "line") {
      return (
        <div className={styles.smartArtWrap}>
          <div className={styles.smartArtLine} style={{ background: shapeFillColor }} />
          {label ? <span className={styles.smartArtLabel} style={{ color: smartArtTextColor }}>{label}</span> : null}
        </div>
      );
    }

    if (shapeType === "arrow") {
      return (
        <div className={styles.smartArtWrap}>
          <div className={styles.smartArtArrow}>
            <div className={styles.smartArtArrowBody} style={{ background: shapeFillColor }} />
            <div className={styles.smartArtArrowHead} style={{ borderLeftColor: shapeFillColor }} />
          </div>
          {label ? <span className={styles.smartArtLabel} style={{ color: smartArtTextColor }}>{label}</span> : null}
        </div>
      );
    }

    if (shapeType === "arrow-left") {
      return (
        <div className={styles.smartArtWrap}>
          <div className={`${styles.smartArtArrow} ${styles.smartArtArrowRotate180}`}>
            <div className={styles.smartArtArrowBody} style={{ background: shapeFillColor }} />
            <div className={styles.smartArtArrowHead} style={{ borderLeftColor: shapeFillColor }} />
          </div>
          {label ? <span className={styles.smartArtLabel} style={{ color: smartArtTextColor }}>{label}</span> : null}
        </div>
      );
    }

    if (shapeType === "arrow-up") {
      return (
        <div className={styles.smartArtWrap}>
          <div className={`${styles.smartArtArrow} ${styles.smartArtArrowRotateMinus90}`}>
            <div className={styles.smartArtArrowBody} style={{ background: shapeFillColor }} />
            <div className={styles.smartArtArrowHead} style={{ borderLeftColor: shapeFillColor }} />
          </div>
          {label ? <span className={styles.smartArtLabel} style={{ color: smartArtTextColor }}>{label}</span> : null}
        </div>
      );
    }

    if (shapeType === "arrow-down") {
      return (
        <div className={styles.smartArtWrap}>
          <div className={`${styles.smartArtArrow} ${styles.smartArtArrowRotate90}`}>
            <div className={styles.smartArtArrowBody} style={{ background: shapeFillColor }} />
            <div className={styles.smartArtArrowHead} style={{ borderLeftColor: shapeFillColor }} />
          </div>
          {label ? <span className={styles.smartArtLabel} style={{ color: smartArtTextColor }}>{label}</span> : null}
        </div>
      );
    }

    if (shapeType === "chevron") {
      return (
        <div className={styles.smartArtWrap}>
          <div className={styles.smartArtChevron} style={{ background: shapeFillColor, color: filledShapeTextColor }}>
            {label ? <span className={styles.smartArtChevronText}>{label}</span> : null}
          </div>
        </div>
      );
    }

    if (shapeType === "line-vertical") {
      return (
        <div className={styles.smartArtWrap}>
          <div className={styles.smartArtLineVertical} style={{ background: shapeFillColor }} />
          {label ? <span className={styles.smartArtLabel} style={{ color: smartArtTextColor }}>{label}</span> : null}
        </div>
      );
    }

    if (shapeType === "connector-elbow") {
      return (
        <div className={styles.smartArtWrap}>
          <div className={styles.smartArtConnectorElbow}>
            <div className={styles.smartArtConnectorElbowVertical} style={{ background: shapeFillColor }} />
            <div className={styles.smartArtConnectorElbowHorizontal} style={{ background: shapeFillColor }} />
          </div>
        </div>
      );
    }

    if (shapeType === "connector-curve") {
      return (
        <div className={styles.smartArtWrap}>
          <svg className={styles.smartArtConnectorCurve} viewBox="0 0 100 100" role="img" aria-label={block.title}>
            <path d="M 8 82 C 28 18, 72 18, 92 82" fill="none" stroke={shapeFillColor} strokeWidth="8" strokeLinecap="round" />
          </svg>
        </div>
      );
    }

    if (shapeType === "circle") {
      return (
        <div className={styles.smartArtWrap}>
          <div className={styles.smartArtCircle} style={{ borderColor: block.accent, background: outlinedShapeFillColor, color: smartArtTextColor }}>
            {label || block.title}
          </div>
        </div>
      );
    }

    return (
      <div className={styles.smartArtWrap}>
        <div className={styles.smartArtRectangle} style={{ borderColor: block.accent, background: outlinedShapeFillColor, color: smartArtTextColor }}>
          {label || block.title}
        </div>
      </div>
    );
  };

  const renderSmartArtPickerIcon = (shapeType: PosterShapeType) => {
    if (shapeType === "arrow") {
      return (
        <div className={`${styles.smartArtPickerPreview} ${styles.smartArtPickerArrow}`}>
          <div className={styles.smartArtArrow}>
            <div className={styles.smartArtArrowBody} />
            <div className={styles.smartArtArrowHead} />
          </div>
        </div>
      );
    }

    if (shapeType === "arrow-left") {
      return (
        <div className={`${styles.smartArtPickerPreview} ${styles.smartArtPickerArrow}`}>
          <div className={`${styles.smartArtArrow} ${styles.smartArtArrowRotate180}`}>
            <div className={styles.smartArtArrowBody} />
            <div className={styles.smartArtArrowHead} />
          </div>
        </div>
      );
    }

    if (shapeType === "arrow-up") {
      return (
        <div className={`${styles.smartArtPickerPreview} ${styles.smartArtPickerArrowVertical}`}>
          <div className={`${styles.smartArtArrow} ${styles.smartArtArrowRotateMinus90}`}>
            <div className={styles.smartArtArrowBody} />
            <div className={styles.smartArtArrowHead} />
          </div>
        </div>
      );
    }

    if (shapeType === "arrow-down") {
      return (
        <div className={`${styles.smartArtPickerPreview} ${styles.smartArtPickerArrowVertical}`}>
          <div className={`${styles.smartArtArrow} ${styles.smartArtArrowRotate90}`}>
            <div className={styles.smartArtArrowBody} />
            <div className={styles.smartArtArrowHead} />
          </div>
        </div>
      );
    }

    if (shapeType === "line") {
      return (
        <div className={styles.smartArtPickerPreview}>
          <div className={styles.smartArtLine} />
        </div>
      );
    }

    if (shapeType === "line-vertical") {
      return (
        <div className={styles.smartArtPickerPreview}>
          <div className={styles.smartArtLineVertical} />
        </div>
      );
    }

    if (shapeType === "connector-elbow") {
      return (
        <div className={styles.smartArtPickerPreview}>
          <div className={styles.smartArtConnectorElbow}>
            <div className={styles.smartArtConnectorElbowVertical} />
            <div className={styles.smartArtConnectorElbowHorizontal} />
          </div>
        </div>
      );
    }

    if (shapeType === "connector-curve") {
      return (
        <div className={styles.smartArtPickerPreview}>
          <svg className={styles.smartArtConnectorCurve} viewBox="0 0 100 100" role="img" aria-label="Curved connector">
            <path d="M 8 82 C 28 18, 72 18, 92 82" fill="none" strokeWidth="8" strokeLinecap="round" />
          </svg>
        </div>
      );
    }

    if (shapeType === "circle") {
      return (
        <div className={styles.smartArtPickerPreview}>
          <div className={styles.smartArtCircle} />
        </div>
      );
    }

    if (shapeType === "chevron") {
      return (
        <div className={styles.smartArtPickerPreview}>
          <div className={styles.smartArtChevron} />
        </div>
      );
    }

    return (
      <div className={styles.smartArtPickerPreview}>
        <div className={styles.smartArtRectangle} />
      </div>
    );
  };

  const renderBlockContent = (block: PosterBlock) => {
    const imported = isImportedBlock(block);

    if (block.kind === "image") {
      if (block.imageUrl) {
        return <div className={styles.imageFrame}><img src={block.imageUrl} alt={block.altText || block.title} className={`${styles.posterImage} ${block.borderStyle ? styles[`image_${block.borderStyle}`] : ""}`} />{block.caption ? <small>{block.caption}</small> : null}</div>;
      }
      return (
        <div className={styles.imageDrop} onDrop={(event) => handleImageDrop(event, block.id)} onDragOver={(event) => event.preventDefault()}>
          <strong>Upload Image</strong>
          <span>Choose, paste, or drag image here</span>
          <label className="button secondaryButton">Choose Image<input type="file" accept="image/*" hidden onChange={(event) => handleImageUpload(event, block.id)} /></label>
        </div>
      );
    }
    if (block.kind === "chart") {
      return <div className={styles.chartPreview}>{renderPosterChart(block, imported)}</div>;
    }
    if (block.kind === "icon") {
      if (isImportedDefaultIconBlock(block)) {
        return <p className={styles.importedTextContent} style={{ color: block.textColor || currentTheme.text }}>{stripLeadingDefaultIcon(block.content)}</p>;
      }

      return <div className={styles.iconPreview} style={{ color: block.textColor || currentTheme.text }}><div>{block.icon || "◆"}</div><span>{block.content}</span></div>;
    }
    if (block.kind === "shape") {
      return renderSmartArt(block);
    }
    if (block.kind === "divider") return <div className={styles.dividerLine} style={{ background: block.accent }} />;
    if (block.embeddedVisuals?.length) {
      return (
        <div className={styles.importedCompositeContent}>
          {block.content ? <p className={styles.importedTextContent} style={{ color: block.textColor || currentTheme.text }}>{stripLeadingDefaultIcon(block.content)}</p> : null}
          {renderEmbeddedVisualCard(block)}
        </div>
      );
    }
    return <p className={imported ? styles.importedTextContent : undefined} style={{ color: block.textColor || currentTheme.text }}>{imported ? stripLeadingDefaultIcon(block.content) : block.content}</p>;
  };

  const getBlockBackground = (block: PosterBlock) => {
    const imported = isImportedBlock(block);

    if (block.sourceColor) return block.sourceColor;
    if (imported && block.kind === "textbox") return currentTheme.importedTextboxBg;
    if (block.kind === "shape") return "transparent";
    if (block.kind === "textbox") return currentTheme.textboxBg;
    if (block.kind === "chart") return currentTheme.chartBg;
    if (block.kind === "icon") return currentTheme.iconBg;
    if (block.kind === "callout") return currentTheme.calloutBg;
    if (block.kind === "divider") return currentTheme.dividerBg;
    return currentTheme.panel;
  };

  const getBlockBorder = (block: PosterBlock) => {
    const imported = isImportedBlock(block);
    const borderColor = block.borderColor || block.accent;

    if (selectedBlockId === block.id && !selectedHeaderField) {
      return `3px solid ${borderColor}`;
    }

    if (imported || block.kind === "chart" || block.kind === "icon") {
      return `2px solid ${borderColor}`;
    }

    if (block.kind === "shape") {
      return "none";
    }

    if (block.kind === "callout") {
      return `2px solid ${borderColor}`;
    }

    return `1px solid ${block.borderColor || currentTheme.line}`;
  };

  const posterDimensions = posterDimensionMap[posterSize][orientation];
  const posterWidth = posterDimensions.width;
  const posterHeight = posterDimensions.height;

  const resizePosterCanvas = (
    nextSize: PosterSize,
    nextOrientation: Orientation
  ) => {
    if (nextSize === posterSize && nextOrientation === orientation) return;

    const nextDimensions = posterDimensionMap[nextSize][nextOrientation];
    const scaleX = nextDimensions.width / posterWidth;
    const scaleY = nextDimensions.height / posterHeight;

    setBlocks((prev) =>
      prev.map((block) => {
        const fittedFrame = fitFrameWithinPoster(
          {
            x: Math.round(block.x * scaleX),
            y: Math.round(block.y * scaleY),
            width: clampPosterSize(
              Math.round(block.width * scaleX),
              block.width,
              180,
              Math.max(220, nextDimensions.width - 80)
            ),
            height: clampPosterSize(
              Math.round(block.height * scaleY),
              block.height,
              90,
              Math.max(140, nextDimensions.height - 120)
            ),
          },
          nextDimensions
        );

        return {
          ...block,
          ...fittedFrame,
        };
      })
    );

    setPosterSize(nextSize);
    setOrientation(nextOrientation);
    setSavedStatus("Unsaved changes");
    setReviewText(`Applied ${nextSize} ${nextOrientation} poster format.`);
  };

  const handlePosterAlert = () => {
    const message = `Please review a change or query in Poster Studio for project ${project.setup.projectNumber || project.setup.policyIssue || "this team"}.`;
    const note = window.prompt("Add an optional note for the admin (leave blank to skip):", "");
    appendAlert("poster", "Poster Studio", message, note ?? undefined);
    setSavedStatus("Admin alert sent.");
    setTimeout(() => setSavedStatus(""), 2200);
  };

  const exportPosterPdf = async () => {
    if (!posterPaperRef.current || isExportingPdf) return;

    const previousBlockId = selectedBlockId;
    const previousHeaderField = selectedHeaderField;
    const filenameBase =
      (project.setup.projectNumber || project.setup.policyIssue || "policy-poster")
        .trim()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "")
        .toLowerCase() || "policy-poster";

    setIsExportingPdf(true);
    setSelectedBlockId("");
    setSelectedHeaderField(null);
    setSavedStatus("Exporting PDF...");

    try {
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      const canvas = await html2canvas(posterPaperRef.current, {
        backgroundColor: currentTheme.bg,
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (documentClone) => {
          const posterClone = documentClone.querySelector("[data-poster-export='true']") as HTMLElement | null;
          if (posterClone) {
            posterClone.style.transform = "none";
            posterClone.style.width = `${posterWidth}px`;
            posterClone.style.minHeight = `${posterHeight}px`;
          }
        },
      });

      const pdf = new jsPDF({
        orientation: canvas.width >= canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
        compress: true,
      });

      const imageData = canvas.toDataURL("image/png");
      pdf.addImage(imageData, "PNG", 0, 0, canvas.width, canvas.height, undefined, "FAST");
      pdf.save(`${filenameBase}-poster.pdf`);
      savePoster(true);
      setSavedStatus("PDF exported");
    } catch (error) {
      console.error("Poster PDF export failed:", error);
      setReviewText("Poster export failed. Please try again.");
      setSavedStatus("Export failed");
    } finally {
      setSelectedBlockId(previousBlockId);
      setSelectedHeaderField(previousHeaderField);
      setIsExportingPdf(false);
    }
  };

  return (
    <main className={styles.posterPage}>
      <section className={styles.topHeader}>
        <div>
          <div className={styles.kicker}>POLICY LAB STUDIO</div>
          <h1>
            Poster
            <br />
            Studio
          </h1>
          <span className={styles.saveStatus}>{savedStatus}{lastSavedAt ? ` · ${new Date(lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}</span>
        </div>
        <div className={styles.headerActions}>
          <Link href="/implementation" className="button secondaryButton">Previous Studio</Link>
          <Link href="/presentation" className="button secondaryButton">Next Studio</Link>
          <Link href="/dashboard" className="button secondaryButton">Dashboard</Link>
          {isAdminSession === false ? (
            <div className={styles.alertRow}>
              <button type="button" className={`button ${styles.alertButton}`} onClick={handlePosterAlert}>Alert Admin</button>
            </div>
          ) : null}
        </div>
      </section>

      <section className={`${styles.studioShell} ${isPreview ? styles.previewMode : ""}`}>
        {!isPreview ? (
          <nav className={styles.sideNav}>
            {sideTabs.map(({ icon, label }) => (
              <button key={label} type="button" title={label} className={`${styles.sideNavButton} ${activeSideTab === label ? styles.sideNavButtonActive : ""}`} onClick={() => setActiveSideTab(label)}>
                <span className={styles.sideNavIcon}>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </nav>
        ) : null}

        {!isPreview ? <aside className={styles.leftPanel}>{renderLeftPanel()}</aside> : null}

        <section className={styles.workspacePanel}>
          <div className={styles.workspaceHeader}>
            <div>
              <h2>Poster Workspace</h2>
              <p>Select a block, edit from the left panel, and save progress.</p>
            </div>
          </div>

          <div ref={workspaceRef} className={styles.workspaceScroll} onPaste={handleWorkspacePaste} onDrop={(event) => handleImageDrop(event)} onDragOver={(event) => event.preventDefault()}>
            <div className={styles.zoomLayer} style={{ width: posterWidth * zoom, height: posterHeight * zoom }}>
              <div ref={posterPaperRef} data-poster-export="true" className={styles.posterPaper} style={{ width: posterWidth, minHeight: posterHeight, background: currentTheme.bg, color: currentTheme.text, transform: `scale(${zoom})` }}>
                <section className={styles.posterHeader} style={{ background: `linear-gradient(135deg, ${currentTheme.primary} 0%, ${currentTheme.secondary} 100%)`, outline: selectedHeaderField ? `4px solid ${currentTheme.accent}` : "none" }} onClick={() => scrollToHeader("title")}>
                  <div className={styles.logoCircle} onClick={(event) => { event.stopPropagation(); scrollToHeader("logo"); }}>
                    {posterHeader.logoImageUrl ? (
                      <img src={posterHeader.logoImageUrl} alt="Poster logo" className={styles.logoImage} />
                    ) : (
                      posterHeader.logo
                    )}
                  </div>
                  <div>
                    <h1 onClick={(event) => { event.stopPropagation(); scrollToHeader("title"); }}>{posterHeader.title}</h1>
                    <p onClick={(event) => { event.stopPropagation(); scrollToHeader("subtitle"); }}>{posterHeader.subtitle}</p>
                  </div>
                  <div className={styles.headerMeta} onClick={(event) => { event.stopPropagation(); scrollToHeader("team"); }}>{posterHeader.team}<br />{posterHeader.course}<br />{posterHeader.instructor}</div>
                </section>

                <section className={styles.posterBody}>
                  {blocks.map((block) => {
                    const imported = isImportedBlock(block);

                    return (
                      <article key={block.id} className={`${styles.posterBlock} ${imported ? styles.importedBlock : ""} ${block.kind === "callout" ? styles.calloutBlock : ""} ${block.kind === "shape" ? styles.shapeBlock : ""}`} title="Drag to reposition" onPointerDown={(event) => startBlockDrag(event, block)} onClick={() => { setSelectedHeaderField(null); setSelectedBlockId(block.id); if (imported) setActiveSideTab("Text"); else if (block.kind === "image" || block.kind === "chart" || block.kind === "icon" || block.kind === "shape") setActiveSideTab("Visuals"); else setActiveSideTab("Text"); }} style={{ border: getBlockBorder(block), borderRadius: block.kind === "divider" ? 4 : block.kind === "shape" ? 0 : 8, padding: block.kind === "divider" ? 10 : block.kind === "shape" ? 0 : 14, left: block.x, top: block.y, width: block.width, height: block.height, background: getBlockBackground(block), color: block.textColor || currentTheme.text, ["--block-text-color" as string]: block.textColor || currentTheme.text, boxShadow: imported || block.kind === "chart" || block.kind === "icon" || block.kind === "callout" ? "0 8px 22px rgba(43, 88, 118, 0.16)" : undefined } as React.CSSProperties}>
                        {block.kind !== "shape" ? (
                          <div className={styles.blockTitleRow} style={{ color: block.textColor || currentTheme.text }}>
                            {!imported ? <span style={{ background: block.accent }}>{block.number}</span> : null}
                            <strong style={{ color: block.textColor || currentTheme.text }}>{block.title.toUpperCase()}</strong>
                          </div>
                        ) : null}
                        {renderBlockContent(block)}
                        {selectedBlockId === block.id && !selectedHeaderField ? (
                          <>
                            {block.kind !== "shape" ? (
                              <>
                                <button type="button" aria-label="Resize width" className={`${styles.resizeHandle} ${styles.resizeHandleRight}`} onPointerDown={(event) => startBlockResize(event, block, "right")} />
                                <button type="button" aria-label="Resize height" className={`${styles.resizeHandle} ${styles.resizeHandleBottom}`} onPointerDown={(event) => startBlockResize(event, block, "bottom")} />
                              </>
                            ) : null}
                            <button type="button" aria-label="Resize card" className={`${styles.resizeHandle} ${styles.resizeHandleCorner}`} onPointerDown={(event) => startBlockResize(event, block, "corner")} />
                          </>
                        ) : null}
                      </article>
                    );
                  })}
                </section>
              </div>
            </div>
          </div>

          <div className={styles.zoomControls}>
            <div className={styles.zoomButtonGroup}>
              <button type="button" className="button secondaryButton" onClick={() => setZoom((prev) => Math.max(0.35, prev - 0.08))}>−</button>
              <span>{Math.round(zoom * 100)}%</span>
              <button type="button" className="button secondaryButton" onClick={() => setZoom((prev) => Math.min(1.2, prev + 0.08))}>+</button>
              <button type="button" className="button secondaryButton" onClick={() => setZoom(0.58)}>Fit</button>
              <button type="button" className="button secondaryButton" onClick={() => setZoom(1)}>100%</button>
              <button type="button" className="button secondaryButton" onClick={resetPosterLayout}>Clear Canvas</button>
            </div>

            <div className={styles.workspaceActions}>
              <button type="button" className="button secondaryButton" onClick={() => setIsPreview((prev) => !prev)}>{isPreview ? "Exit Preview" : "Preview"}</button>
              <button type="button" className={`button ${styles.exportPdfButton}`} onClick={exportPosterPdf} disabled={isExportingPdf}>
                {isExportingPdf ? "Exporting..." : "Export PDF"}
              </button>
              <button type="button" className="button saveProgressButton" onClick={() => savePoster(false)}>Save Progress</button>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
