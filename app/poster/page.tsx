"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useProject } from "@/components/ProjectState/ProjectProvider";
import {
  buildPosterContent,
  readAllStudioObjectsFromProject,
} from "@/components/ProjectState/projectService";
import { getProjectStudioStorageKey } from "@/components/ProjectState/projectStorage";
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

const posterSections = [
  ["header", "Header", "Title, logo, subtitle"],
  ["problem", "Problem", "Problem statement"],
  ["evidence", "Evidence", "Key data & statistics"],
  ["population", "Target Population", "Users / Beneficiaries"],
  ["stakeholders", "Stakeholders", "Key actors & system"],
  ["solution", "Solution", "Proposed Solution"],
  ["journey", "User Journey", "User journey"],
  ["implementation", "Implementation", "Key activities"],
  ["timeline", "Timeline", "Phases & milestones"],
  ["indicators", "Dashboard", "Indicators / metrics"],
  ["funding", "Funding", "Cost & resources"],
  ["partners", "Partners", "Collaborators"],
] as const;

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

const sideTabs: { icon: string; label: SideTab }[] = [
  { icon: "🏠", label: "Home" },
  { icon: "🧩", label: "Elements" },
  { icon: "T", label: "Text" },
  { icon: "🖼️", label: "Visuals" },
  { icon: "▦", label: "Layout" },
  { icon: "🎨", label: "Theme" },
  { icon: "⬆", label: "Import" },
  { icon: "🤖", label: "Coach" },
];

const themeMap: Record<ThemeName, { label: string; primary: string; accent: string; bg: string }> = {
  academic: { label: "Academic Blue", primary: "#1e3a5f", accent: "#d4a574", bg: "#ffffff" },
  modern: { label: "Modern", primary: "#2b5876", accent: "#c8954a", bg: "#ffffff" },
  minimal: { label: "Minimal", primary: "#111827", accent: "#64748b", bg: "#ffffff" },
  dark: { label: "Dark", primary: "#020617", accent: "#38bdf8", bg: "#f8fafc" },
  institutional: { label: "Institutional", primary: "#1e3a5f", accent: "#d4a574", bg: "#ffffff" },
};

const placeholderTexts = ["describe", "add", "summarize", "placeholder"];

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
      localStorage.setItem(
        projectScopedStorageKey,
        JSON.stringify(posterState)
      );
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

  const getBlockStatus = (block?: PosterBlock) => {
    if (!block) return "+";
    const text = block.content.trim().toLowerCase();
    if (!text) return "○";
    if (placeholderTexts.some((item) => text.startsWith(item)) || text.includes("placeholder")) {
      return "⚠";
    }
    return "✓";
  };

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
    const visualCount = blocks.filter((block) => block.kind !== "section").length;
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
      x: kind === "divider" ? 0 : 80 + (visualCount % 2) * 440,
      y: 1380 + Math.floor(visualCount / 2) * 210,
      width: kind === "divider" ? 1200 : 420,
      height: kind === "divider" ? 60 : 180,
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

  const importSelectedFromStudios = () => {
    const posterContent = readPosterContent();
    const smartContent: Record<string, string | undefined> = {
      problem: posterContent.problem,
      evidence: posterContent.evidence,
      stakeholders: posterContent.stakeholders,
      journey: posterContent.population,
      solution: posterContent.solution,
      implementation: posterContent.implementation,
      risks: posterContent.risks,
      indicators: posterContent.indicators,
      timeline: posterContent.implementation,
      funding: posterContent.implementation,
      partners: posterContent.stakeholders,
    };
    setBlocks((prev) =>
      prev.map((block) => {
        if (!selectedImports[block.id]) return block;
        return { ...block, content: smartContent[block.id] || block.content };
      })
    );
    if (selectedImports.charts) importChartFromStudios("Problem/Evidence");
    if (selectedImports.icons) importIconFromStudios("Problem/Evidence");
    setReviewText("Selected content imported from previous studios.");
    setSavedStatus("Unsaved changes");
  };

  const importChartFromStudios = (source: "Problem/Evidence" | "Process" | "Solution" | "Implementation") => {
    const posterContent = readPosterContent();

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
      x: 460,
      y: 1380 + blocks.filter((block) => block.kind === "chart").length * 240,
      width: 440,
      height: 220,
      kind: "chart",
      content,
    };

    setBlocks((prev) => [...prev, chartBlock]);
    setSelectedBlockId(chartBlock.id);
    setSelectedHeaderField(null);
    setSavedStatus("Unsaved changes");
    setReviewText(`Chart imported from ${source} studio content.`);
  };

  const importIconFromStudios = (source: "Problem/Evidence" | "Process" | "Solution" | "Implementation") => {
    const posterContent = readPosterContent();

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
      x: 920,
      y: 1380 + blocks.filter((block) => block.kind === "icon").length * 200,
      width: 340,
      height: 180,
      kind: "icon",
      content,
    };

    setBlocks((prev) => [...prev, iconBlock]);
    setSelectedBlockId(iconBlock.id);
    setSelectedHeaderField(null);
    setSavedStatus("Unsaved changes");
    setReviewText(`Icon imported from ${source} studio content.`);
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
      return (
        <>
          <h2>Document Outline</h2>
          <p className="fieldNote">Jump to any section and edit it on the poster.</p>
          <div className={styles.toolList}>
            {posterSections.map(([id, title, note]) => {
              const target = id === "header" ? undefined : blocks.find((block) => block.id === id);
              const active = (id === "header" && selectedHeaderField) || target?.id === selectedBlockId;
              return (
                <button
                  key={id}
                  type="button"
                  className={`${styles.toolCardButton} ${active ? styles.toolCardActive : ""}`}
                  onClick={() => (id === "header" ? scrollToHeader("title") : target && scrollToBlock(target))}
                >
                  <strong>{id === "header" ? "✓" : getBlockStatus(target)} {title}</strong>
                  <span>{note}</span>
                </button>
              );
            })}
          </div>
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
    if (!selectedBlock || selectedBlock.kind !== "image") return null;
    return (
      <div className={styles.editorBox}>
        <h3>Image Tools</h3>
        <label className="button secondaryButton">
          {selectedBlock.imageUrl ? "Replace Image" : "Upload Image"}
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={(event) => handleImageUpload(event, selectedBlock.id)} />
        </label>
        {selectedBlock.imageUrl ? <button type="button" className="button secondaryButton" onClick={() => updateBlock(selectedBlock.id, { imageUrl: undefined, content: "Image placeholder. Upload, paste, or drag an image here." })}>Remove Image</button> : null}
        <label className="fieldLabel"><span>Caption</span><textarea rows={3} value={selectedBlock.caption || ""} onChange={(event) => updateBlock(selectedBlock.id, { caption: event.target.value })} /></label>
        <label className="fieldLabel"><span>Alt Text</span><textarea rows={3} value={selectedBlock.altText || ""} onChange={(event) => updateBlock(selectedBlock.id, { altText: event.target.value })} /></label>
        <label className="fieldLabel"><span>Style</span><select value={selectedBlock.borderStyle || "none"} onChange={(event) => updateBlock(selectedBlock.id, { borderStyle: event.target.value as PosterBlock["borderStyle"] })}><option value="none">None</option><option value="rounded">Rounded</option><option value="shadow">Shadow</option><option value="frame">Frame</option></select></label>
        <button type="button" className="button secondaryButton" onClick={duplicateSelectedBlock}>Duplicate Image</button>
        <button type="button" className="button secondaryButton" onClick={deleteSelectedBlock}>Delete Image</button>
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

  const renderBlockContent = (block: PosterBlock) => {
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
      return <div className={styles.chartPreview}><strong>Imported Chart</strong><span>{block.content}</span><div className={styles.miniBars}><i /><i /><i /><i /></div></div>;
    }
    if (block.kind === "icon") {
      return <div className={styles.iconPreview}><div>◆</div><span>{block.content}</span></div>;
    }
    if (block.kind === "divider") return <div className={styles.dividerLine} style={{ background: block.accent }} />;
    return <p>{block.content}</p>;
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
                  {blocks.map((block) => (
                    <article key={block.id} className={styles.posterBlock} title="Drag to reposition" onPointerDown={(event) => startBlockDrag(event, block)} onClick={() => { setSelectedHeaderField(null); setSelectedBlockId(block.id); if (block.kind === "image") setActiveSideTab("Visuals"); else if (block.kind === "chart" || block.kind === "icon") setActiveSideTab("Visuals"); else setActiveSideTab("Text"); }} style={{ border: selectedBlockId === block.id && !selectedHeaderField ? `3px solid ${block.accent}` : "1px solid #d8e0ee", borderRadius: block.kind === "divider" ? 4 : 8, padding: block.kind === "divider" ? 10 : 14, left: block.x, top: block.y, width: block.width, height: block.height, background: block.kind === "callout" ? "#fff7ed" : block.kind === "divider" ? "#f8fafc" : "#ffffff" }}>
                      <div className={styles.blockTitleRow}><span style={{ background: block.accent }}>{block.number}</span><strong>{block.title.toUpperCase()}</strong></div>
                      {renderBlockContent(block)}
                    </article>
                  ))}
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
