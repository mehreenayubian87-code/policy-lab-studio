"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useProject } from "@/components/ProjectState/ProjectProvider";
import type { ProjectObject } from "@/components/ProjectState/ProjectProvider";
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
  | "callout"
  | "divider";

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
  icon?: string;
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
  team: string;
  course: string;
  instructor: string;
};

type ThemeName = "academic" | "modern" | "minimal" | "dark" | "institutional";
type PosterSize = "A0" | "A1" | "A2";
type Orientation = "portrait" | "landscape";
type LayoutName = "academic" | "story" | "dashboard" | "custom";
type SideTab =
  | "Home"
  | "Elements"
  | "Text"
  | "Visuals"
  | "Layout"
  | "Theme"
  | "Import"
  | "Coach";

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
  { icon: "🏠", label: "Home" },
  { icon: "🧩", label: "Elements" },
  { icon: "▦", label: "Layout" },
  { icon: "🎨", label: "Theme" },
  { icon: "⬆", label: "Import" },
];

const themeMap: Record<ThemeName, { label: string; primary: string; accent: string; bg: string }> = {
  academic: { label: "Academic Blue", primary: "#1e3a5f", accent: "#d4a574", bg: "#ffffff" },
  modern: { label: "Modern", primary: "#2b5876", accent: "#c8954a", bg: "#ffffff" },
  minimal: { label: "Minimal", primary: "#111827", accent: "#64748b", bg: "#ffffff" },
  dark: { label: "Dark", primary: "#020617", accent: "#38bdf8", bg: "#f8fafc" },
  institutional: { label: "Institutional", primary: "#1e3a5f", accent: "#d4a574", bg: "#ffffff" },
};

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
      : object.icon || object.visualType === "icon" || object.type === "icon"
      ? "icon"
      : object.type;

  return `${object.studioId}:${baseId}:${visualKind}`;
};

const getElementSelectionKey = (object: ProjectObject) =>
  `${object.studioId}:${object.id}`;

export default function PosterStudioPage() {
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
  const [selectedImports, setSelectedImports] = useState<Record<string, boolean>>(
    Object.fromEntries(importOptions.map(([key]) => [key, true]))
  );
  const [selectedElementImports, setSelectedElementImports] = useState<Record<string, boolean>>({});

  const workspaceRef = useRef<HTMLDivElement | null>(null);
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
      ["textbox", "callout", "divider"].includes(block.kind)
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
          : kind === "callout"
          ? "Callout"
          : "Divider",
      type:
        kind === "chart"
          ? "Imported from previous studio"
          : kind === "icon"
          ? "Imported from previous studio"
          : "Visual Element",
      accent: currentTheme.accent,
      x: kind === "divider" ? 60 : 80 + (topElementCount % 2) * 460,
      y: 260 + Math.floor(topElementCount / 2) * 220,
      width: kind === "divider" ? 1200 : 420,
      height: kind === "divider" ? 60 : kind === "callout" ? 200 : 180,
      kind,
      content:
        kind === "textbox"
          ? "Add your text here."
          : kind === "image"
          ? "Image placeholder. Upload, paste, or drag an image here."
          : kind === "chart"
          ? "Imported chart content will appear here."
          : kind === "icon"
          ? "Imported icon or visual symbol will appear here."
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
    const text = selectedHeaderField ? posterHeader[selectedHeaderField] : selectedBlock?.content ?? "";
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
      return Boolean(object.icon) || object.visualType === "icon" || object.type === "icon";
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
        : object.icon || object.visualType === "icon" || object.type === "icon"
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
      content: object.content || object.title,
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
      setActiveSideTab(
        firstImportedBlock.kind === "chart" || firstImportedBlock.kind === "icon"
          ? "Visuals"
          : "Text"
      );
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
      setActiveSideTab(
        firstImportedBlock.kind === "chart" || firstImportedBlock.kind === "icon" || firstImportedBlock.kind === "image"
          ? "Visuals"
          : "Text"
      );
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
    if (layout === "custom") {
      const customLayout = {
        problem: { x: 0, y: 0, width: 670, height: 260 },
        evidence: { x: 690, y: 0, width: 670, height: 260 },
        stakeholders: { x: 0, y: 280, width: 440, height: 260 },
        population: { x: 460, y: 280, width: 440, height: 260 },
        journey: { x: 920, y: 280, width: 440, height: 260 },
        solution: { x: 0, y: 560, width: 670, height: 300 },
        implementation: { x: 690, y: 560, width: 670, height: 300 },
        risks: { x: 0, y: 880, width: 440, height: 240 },
        indicators: { x: 460, y: 880, width: 440, height: 240 },
        timeline: { x: 920, y: 880, width: 440, height: 240 },
        funding: { x: 0, y: 1140, width: 440, height: 220 },
        partners: { x: 460, y: 1140, width: 900, height: 220 },
      };

      setBlocks((prev) =>
        prev.map((block) => ({
          ...block,
          ...(customLayout[block.id as keyof typeof customLayout] ?? {}),
        }))
      );
      setReviewText("Applied Custom Layout. You can now drag blocks on the canvas to fine-tune placement.");
      setSavedStatus("Unsaved changes");
      return;
    }
    const layouts = {
      academic: {
        problem: { x: 0, y: 0, width: 440, height: 230 },
        evidence: { x: 460, y: 0, width: 440, height: 230 },
        population: { x: 920, y: 0, width: 440, height: 230 },
        stakeholders: { x: 0, y: 250, width: 440, height: 260 },
        solution: { x: 460, y: 250, width: 440, height: 260 },
        journey: { x: 920, y: 250, width: 440, height: 260 },
        implementation: { x: 0, y: 530, width: 670, height: 300 },
        risks: { x: 690, y: 530, width: 670, height: 300 },
        indicators: { x: 0, y: 850, width: 440, height: 230 },
        timeline: { x: 460, y: 850, width: 440, height: 230 },
        funding: { x: 920, y: 850, width: 440, height: 230 },
        partners: { x: 0, y: 1100, width: 1360, height: 230 },
      },
      story: {
        problem: { x: 0, y: 0, width: 420, height: 240 },
        population: { x: 440, y: 0, width: 420, height: 240 },
        journey: { x: 880, y: 0, width: 480, height: 520 },
        evidence: { x: 0, y: 260, width: 420, height: 260 },
        stakeholders: { x: 440, y: 260, width: 420, height: 260 },
        solution: { x: 0, y: 540, width: 650, height: 300 },
        implementation: { x: 670, y: 540, width: 690, height: 300 },
        risks: { x: 0, y: 860, width: 440, height: 240 },
        indicators: { x: 460, y: 860, width: 440, height: 240 },
        timeline: { x: 920, y: 860, width: 440, height: 240 },
        funding: { x: 0, y: 1120, width: 440, height: 220 },
        partners: { x: 460, y: 1120, width: 900, height: 220 },
      },
      dashboard: {
        problem: { x: 0, y: 0, width: 430, height: 220 },
        solution: { x: 450, y: 0, width: 430, height: 220 },
        indicators: { x: 900, y: 0, width: 460, height: 220 },
        evidence: { x: 0, y: 240, width: 670, height: 320 },
        timeline: { x: 690, y: 240, width: 670, height: 320 },
        stakeholders: { x: 0, y: 580, width: 430, height: 260 },
        population: { x: 450, y: 580, width: 430, height: 260 },
        risks: { x: 900, y: 580, width: 460, height: 260 },
        implementation: { x: 0, y: 860, width: 900, height: 300 },
        funding: { x: 920, y: 860, width: 440, height: 300 },
        journey: { x: 0, y: 1180, width: 670, height: 240 },
        partners: { x: 690, y: 1180, width: 670, height: 240 },
      },
    };
    setBlocks((prev) =>
      prev.map((block) => ({
        ...block,
        ...(layouts[layout][block.id as keyof typeof layouts.academic] ?? {}),
      }))
    );
    setReviewText(`Applied ${layout} layout.`);
    setSavedStatus("Unsaved changes");
  };

  const generateLayouts = () => {
    setLayoutSuggestions(["Academic Conference Layout", "Storytelling / User Journey Layout", "Dashboard Policy Layout", "Custom Layout"]);
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
    if (activeSideTab === "Home") {
      return (
        <>
          <h2>Poster Studio</h2>
          <p className="fieldNote">Build a conference-style poster from your completed policy work.</p>
          <button type="button" className="button saveProgressButton" onClick={() => savePoster(false)}>Save Progress</button>
          <button type="button" className="button secondaryButton" onClick={() => setIsPreview((prev) => !prev)}>{isPreview ? "Exit Preview" : "Preview Poster"}</button>
          <button type="button" className="button secondaryButton" onClick={() => window.print()}>Export / Print</button>
        </>
      );
    }

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
          {selectedBlock && selectedBlock.kind !== "image" ? renderElementEditor() : null}
        </>
      );
    }

    if (activeSideTab === "Visuals") {
      const importSources: Array<"Problem/Evidence" | "Process" | "Solution" | "Implementation"> = [
        "Problem/Evidence",
        "Process",
        "Solution",
        "Implementation",
      ];

      return (
        <>
          <h2>Visuals</h2>
          <p className="fieldNote">Upload images here. Charts and icons are imported from previous studio outputs.</p>
          <div className={styles.toolList}>
            <button type="button" className={styles.toolCardButton} onClick={() => addVisualElement("image")}><strong>+ Image</strong><span>Upload, paste, or drag-drop</span></button>
          </div>

          <h3 className={styles.panelSubheading}>Import Chart</h3>
          <div className={styles.toolList}>
            {importSources.map((source) => (
              <button key={`chart-${source}`} type="button" className={styles.toolCardButton} onClick={() => importChartFromStudios(source)}><strong>{source}</strong><span>Import chart-ready content</span></button>
            ))}
          </div>

          <h3 className={styles.panelSubheading}>Import Icon</h3>
          <div className={styles.toolList}>
            {importSources.map((source) => (
              <button key={`icon-${source}`} type="button" className={styles.toolCardButton} onClick={() => importIconFromStudios(source)}><strong>{source}</strong><span>Import icon-related content</span></button>
            ))}
          </div>

          {selectedBlock?.kind === "image" ? renderImageEditor() : null}
        </>
      );
    }

    if (activeSideTab === "Layout") {
      const generated = layoutSuggestions.length ? layoutSuggestions : ["Academic Conference Layout", "Storytelling / User Journey Layout", "Dashboard Policy Layout", "Custom Layout"];
      return (
        <>
          <h2>Poster Layouts</h2>
          <p className="fieldNote">Generate and apply one layout. This is the only layout control area.</p>
          <button type="button" className="button" onClick={generateLayouts}>Generate Layouts</button>
          <div className={styles.toolList}>
            {generated.map((layout, index) => {
              const layoutType: LayoutName = index === 0 ? "academic" : index === 1 ? "story" : index === 2 ? "dashboard" : "custom";
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
            {(["A0", "A1", "A2"] as PosterSize[]).map((size) => <button key={size} type="button" className={`${styles.pillButton} ${posterSize === size ? styles.pillActive : ""}`} onClick={() => setPosterSize(size)}>{size}</button>)}
          </div>
          <h3>Orientation</h3>
          <div className={styles.compactGrid}>
            {(["landscape", "portrait"] as Orientation[]).map((item) => <button key={item} type="button" className={`${styles.pillButton} ${orientation === item ? styles.pillActive : ""}`} onClick={() => setOrientation(item)}>{item}</button>)}
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

  function renderElementEditor() {
    if (!selectedBlock) return null;
    return (
      <div className={styles.editorBox}>
        <h3>Element Editor</h3>
        <label className="fieldLabel"><span>Title</span><input value={selectedBlock.title} onChange={(event) => updateBlock(selectedBlock.id, { title: event.target.value })} /></label>
        <label className="fieldLabel"><span>Type / Caption</span><input value={selectedBlock.type} onChange={(event) => updateBlock(selectedBlock.id, { type: event.target.value })} /></label>
        <label className="fieldLabel"><span>Content</span><textarea rows={6} value={selectedBlock.content} onChange={(event) => updateBlock(selectedBlock.id, { content: event.target.value })} /></label>
        <div className={styles.twoButtonRow}><button type="button" className="button secondaryButton" onClick={copySelectedContent}>Copy</button><button type="button" className="button secondaryButton" onClick={pasteIntoSelected}>Paste</button></div>
        <button type="button" className="button secondaryButton" onClick={duplicateSelectedBlock}>Duplicate</button>
        <button type="button" className="button secondaryButton" disabled={selectedBlock.kind === "section"} onClick={deleteSelectedBlock}>Delete</button>
      </div>
    );
  }

  function renderImageEditor() {
    if (!selectedBlock || !["image", "chart", "icon"].includes(selectedBlock.kind)) return null;
    return (
      <div className={styles.editorBox}>
        <h3>{selectedBlock.kind === "image" ? "Image Tools" : "Visual Tools"}</h3>
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

    if (block.kind === "image" || block.kind === "chart" || block.kind === "icon") {
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

    if (block.kind === "divider") return;

    setSelectedHeaderField(null);
    setSelectedBlockId(block.id);

    const startX = event.clientX;
    const startY = event.clientY;
    const originalWidth = block.width;
    const originalHeight = block.height;
    const minWidth = block.kind === "icon" ? 180 : 220;
    const minHeight = block.kind === "icon" ? 130 : 150;

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

    if (!data.length) {
      return (
        <>
          <strong>{imported ? "Imported Chart" : "Chart"}</strong>
          <span>{block.content}</span>
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
          <strong>{block.title}</strong>
          <svg className={styles.posterChartSvg} viewBox="0 0 420 180" role="img" aria-label={block.title}>
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
        </>
      );
    }

    return (
      <>
        <strong>{block.title}</strong>
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
      return <div className={styles.iconPreview}><div>{block.icon || "◆"}</div><span>{block.content}</span></div>;
    }
    if (block.kind === "divider") return <div className={styles.dividerLine} style={{ background: block.accent }} />;
    if (block.embeddedVisuals?.length) {
      return (
        <div className={styles.importedCompositeContent}>
          {block.content ? <p className={styles.importedTextContent}>{block.content}</p> : null}
          {renderEmbeddedVisualCard(block)}
        </div>
      );
    }
    return <p className={imported ? styles.importedTextContent : undefined}>{block.content}</p>;
  };

  const getBlockBackground = (block: PosterBlock) => {
    const imported = isImportedBlock(block);

    if (block.sourceColor) return block.sourceColor;
    if (imported && block.kind === "textbox") return "#fff3d6";
    if (block.kind === "textbox") return "#fffaf0";
    if (block.kind === "chart") return "#eef8f4";
    if (block.kind === "icon") return "#f2edff";
    if (block.kind === "callout") return "#fff1d6";
    if (block.kind === "divider") return "#f8fafc";
    return "#ffffff";
  };

  const getBlockBorder = (block: PosterBlock) => {
    const imported = isImportedBlock(block);

    if (selectedBlockId === block.id && !selectedHeaderField) {
      return `3px solid ${block.accent}`;
    }

    if (imported || block.kind === "chart" || block.kind === "icon") {
      return `2px solid ${block.accent}`;
    }

    if (block.kind === "callout") {
      return `2px solid ${block.accent}`;
    }

    return "1px solid #d8e0ee";
  };

  const posterWidth = orientation === "landscape" ? 1400 : 980;
  const posterHeight = orientation === "landscape" ? 2100 : 2400;

  const handlePosterAlert = () => {
    const message = `Please review a change or query in Poster Studio for project ${project.setup.projectNumber || project.setup.policyIssue || "this team"}.`;
    const note = window.prompt("Add an optional note for the admin (leave blank to skip):", "");
    appendAlert("poster", "Poster Studio", message, note ?? undefined);
    setSavedStatus("Admin alert sent.");
    setTimeout(() => setSavedStatus(""), 2200);
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
          <div className={styles.alertRow}>
            <button type="button" className={`button ${styles.alertButton}`} onClick={handlePosterAlert}>Alert Admin</button>
          </div>
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
            <div className={styles.zoomLayer} style={{ width: posterWidth + 100, minHeight: posterHeight + 100, transform: `scale(${zoom})` }}>
              <div className={styles.posterPaper} style={{ width: posterWidth, minHeight: posterHeight, background: currentTheme.bg }}>
                <section className={styles.posterHeader} style={{ background: `linear-gradient(135deg, ${currentTheme.primary} 0%, #2b5876 100%)`, outline: selectedHeaderField ? `4px solid ${currentTheme.accent}` : "none" }} onClick={() => scrollToHeader("title")}>
                  <div className={styles.logoCircle} onClick={(event) => { event.stopPropagation(); scrollToHeader("logo"); }}>{posterHeader.logo}</div>
                  <div><h1>{posterHeader.title}</h1><p>{posterHeader.subtitle}</p></div>
                  <div className={styles.headerMeta}>{posterHeader.team}<br />{posterHeader.course}<br />{posterHeader.instructor}</div>
                </section>

                <section className={styles.posterBody}>
                  {blocks.map((block) => {
                    const imported = isImportedBlock(block);

                    return (
                      <article key={block.id} className={`${styles.posterBlock} ${imported ? styles.importedBlock : ""} ${block.kind === "callout" ? styles.calloutBlock : ""}`} title="Drag to reposition" onPointerDown={(event) => startBlockDrag(event, block)} onClick={() => { setSelectedHeaderField(null); setSelectedBlockId(block.id); if (block.kind === "image") setActiveSideTab("Visuals"); else if (block.kind === "chart" || block.kind === "icon") setActiveSideTab("Visuals"); else setActiveSideTab("Text"); }} style={{ border: getBlockBorder(block), borderRadius: block.kind === "divider" ? 4 : 8, padding: block.kind === "divider" ? 10 : 14, left: block.x, top: block.y, width: block.width, height: block.height, background: getBlockBackground(block), color: "#111827", boxShadow: imported || block.kind === "chart" || block.kind === "icon" || block.kind === "callout" ? "0 8px 22px rgba(43, 88, 118, 0.16)" : undefined }}>
                        <div className={styles.blockTitleRow}>
                          {!imported ? <span style={{ background: block.accent }}>{block.number}</span> : null}
                          <strong>{block.title.toUpperCase()}</strong>
                        </div>
                        {renderBlockContent(block)}
                        {selectedBlockId === block.id && !selectedHeaderField && block.kind !== "divider" ? (
                          <>
                            <button type="button" aria-label="Resize width" className={`${styles.resizeHandle} ${styles.resizeHandleRight}`} onPointerDown={(event) => startBlockResize(event, block, "right")} />
                            <button type="button" aria-label="Resize height" className={`${styles.resizeHandle} ${styles.resizeHandleBottom}`} onPointerDown={(event) => startBlockResize(event, block, "bottom")} />
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
              <button type="button" className="button secondaryButton" onClick={resetPosterLayout}>Reset Layout</button>
            </div>

            <div className={styles.workspaceActions}>
              <button type="button" className="button secondaryButton" onClick={() => setIsPreview((prev) => !prev)}>{isPreview ? "Exit Preview" : "Preview"}</button>
              <button type="button" className="button" onClick={() => window.print()}>Export</button>
              <button type="button" className="button saveProgressButton" onClick={() => savePoster(false)}>Save Progress</button>
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
