"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useProject } from "@/components/ProjectState/ProjectProvider";
import {
  buildPosterContent,
  readAllStudioObjects,
} from "@/components/ProjectState/projectService";

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
};

type PosterHeader = {
  title: string;
  subtitle: string;
  logo: string;
  team: string;
  course: string;
  instructor: string;
};

const POSTER_STORAGE_KEY = "plstudio_poster_v2";

const initialHeader: PosterHeader = {
  title: "POLICY POSTER TITLE",
  subtitle:
    "A policy proposal to improve outcomes through evidence, implementation planning, and stakeholder engagement.",
  logo: "🏫",
  team: "Team Name",
  course: "Course / Policy Lab",
  instructor: "Instructor",
};

const initialBlocks: PosterBlock[] = [
  {
    id: "problem",
    number: "1",
    title: "The Problem",
    type: "Problem Statement",
    accent: "#f97316",
    x: 0,
    y: 0,
    width: 440,
    height: 230,
    kind: "section",
    content:
      "Describe the core policy problem, who is affected, where it occurs, and why it matters.",
  },
  {
    id: "evidence",
    number: "2",
    title: "Key Evidence",
    type: "Data & Statistics",
    accent: "#2563eb",
    x: 460,
    y: 0,
    width: 440,
    height: 230,
    kind: "section",
    content:
      "Add your strongest evidence, statistics, sources, and key findings from the Problem Studio.",
  },
  {
    id: "population",
    number: "3",
    title: "Target Population",
    type: "Users / Beneficiaries",
    accent: "#059669",
    x: 920,
    y: 0,
    width: 440,
    height: 230,
    kind: "section",
    content:
      "Describe the population affected by the problem and who the solution is designed for.",
  },
  {
    id: "stakeholders",
    number: "4",
    title: "Stakeholders & System",
    type: "Process Studio",
    accent: "#7c3aed",
    x: 0,
    y: 250,
    width: 440,
    height: 260,
    kind: "section",
    content:
      "Summarize key actors, power relationships, governance barriers, and system dynamics.",
  },
  {
    id: "solution",
    number: "5",
    title: "Proposed Solution",
    type: "Solution Studio",
    accent: "#16a34a",
    x: 460,
    y: 250,
    width: 440,
    height: 260,
    kind: "section",
    content:
      "Describe the selected solution, why it is appropriate, and how it responds to the problem.",
  },
  {
    id: "journey",
    number: "6",
    title: "User Journey",
    type: "Experience / Pathway",
    accent: "#ea580c",
    x: 920,
    y: 250,
    width: 440,
    height: 260,
    kind: "section",
    content:
      "Show how the user moves from awareness to engagement, service use, and improved outcomes.",
  },
  {
    id: "implementation",
    number: "7",
    title: "Implementation Plan",
    type: "Timeline / Activities",
    accent: "#0891b2",
    x: 0,
    y: 530,
    width: 670,
    height: 300,
    kind: "section",
    content:
      "Add implementation phases, owners, key activities, resources, and delivery milestones.",
  },
  {
    id: "risks",
    number: "8",
    title: "Risks & Mitigation",
    type: "Risk Register",
    accent: "#be123c",
    x: 690,
    y: 530,
    width: 670,
    height: 300,
    kind: "section",
    content:
      "List major risks and mitigation strategies for implementation and sustainability.",
  },
  {
    id: "indicators",
    number: "9",
    title: "Monitoring & Indicators",
    type: "Dashboard",
    accent: "#0f766e",
    x: 0,
    y: 850,
    width: 440,
    height: 230,
    kind: "section",
    content:
      "Add measurable indicators, targets, data sources, and monitoring frequency.",
  },
  {
    id: "timeline",
    number: "10",
    title: "Timeline Overview",
    type: "Milestones",
    accent: "#1d4ed8",
    x: 460,
    y: 850,
    width: 440,
    height: 230,
    kind: "section",
    content:
      "Summarize the timeline from preparation to pilot, scale-up, and sustainability.",
  },
  {
    id: "funding",
    number: "11",
    title: "Funding & Resources",
    type: "Budget / Ownership",
    accent: "#b45309",
    x: 920,
    y: 850,
    width: 440,
    height: 230,
    kind: "section",
    content:
      "Add estimated resources, funding sources, ownership, and responsible institutions.",
  },
  {
    id: "partners",
    number: "12",
    title: "Partners & Collaborators",
    type: "Team / Institutions",
    accent: "#6d28d9",
    x: 0,
    y: 1100,
    width: 1360,
    height: 230,
    kind: "section",
    content:
      "Add partners, collaborators, team members, course, instructor, and contact information.",
  },
];

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
  ["team", "Team", "Team information"],
];

const visualElements = [
  ["textbox", "Text Box", "Editable text block"],
  ["image", "Image", "Image placeholder with caption"],
  ["chart", "Chart", "Chart placeholder with notes"],
  ["icon", "Icon", "Icon placeholder"],
  ["callout", "Callout", "Highlighted note"],
  ["divider", "Divider", "Section divider"],
];

export default function PosterStudioPage() {
  const { importObjects } = useProject();

  const [posterHeader, setPosterHeader] = useState(initialHeader);
  const [blocks, setBlocks] = useState<PosterBlock[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState("problem");
  const [selectedHeaderField, setSelectedHeaderField] =
    useState<keyof PosterHeader | null>(null);
  const [aiPrompt, setAiPrompt] = useState("");
  const [layoutSuggestions, setLayoutSuggestions] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [zoom, setZoom] = useState(0.58);
  const [savedStatus, setSavedStatus] = useState("");

  const workspaceRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(POSTER_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw);
      if (parsed.posterHeader) setPosterHeader(parsed.posterHeader);
      if (Array.isArray(parsed.blocks)) setBlocks(parsed.blocks);
    } catch (error) {
      console.error(error);
    }
  }, []);

  const selectedBlock = blocks.find((block) => block.id === selectedBlockId);

  const completedCount = useMemo(
    () => blocks.filter((block) => block.content.trim()).length,
    [blocks]
  );

  const getBlockStatus = (block?: PosterBlock) => {
    if (!block) return "+";
    const text = block.content.trim();

    if (!text) return "○";
    if (
      text.startsWith("Describe") ||
      text.startsWith("Add") ||
      text.startsWith("Summarize") ||
      text.includes("placeholder")
    ) {
      return "⚠";
    }

    return "✓";
  };

  const scrollToHeader = (field: keyof PosterHeader = "title") => {
    setSelectedHeaderField(field);
    setSelectedBlockId("");

    workspaceRef.current?.scrollTo({
      left: 0,
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToBlock = (block: PosterBlock) => {
    setSelectedHeaderField(null);
    setSelectedBlockId(block.id);

    workspaceRef.current?.scrollTo({
      left: Math.max(0, block.x * zoom - 80),
      top: Math.max(0, (block.y + 170) * zoom - 80),
      behavior: "smooth",
    });
  };

  const updateHeader = (changes: Partial<PosterHeader>) => {
    setPosterHeader((prev) => ({ ...prev, ...changes }));
    setSavedStatus("");
  };

  const updateBlock = (id: string, changes: Partial<PosterBlock>) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, ...changes } : block))
    );
    setSavedStatus("");
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
          ? "Image Placeholder"
          : kind === "chart"
          ? "Chart Placeholder"
          : kind === "icon"
          ? "Icon Placeholder"
          : kind === "callout"
          ? "Callout"
          : "Divider",
      type: "Visual Element",
      accent: "#0f2f66",
      x: kind === "divider" ? 0 : 80,
      y: 1380 + visualCount * 180,
      width: kind === "divider" ? 1200 : 420,
      height: kind === "divider" ? 60 : 180,
      kind,
      content:
        kind === "textbox"
          ? "Add your text here."
          : kind === "image"
          ? "Image placeholder. Add caption or image notes here."
          : kind === "chart"
          ? "Chart placeholder. Add chart title, data source, and key message."
          : kind === "icon"
          ? "Icon placeholder. Describe the icon meaning."
          : kind === "callout"
          ? "Highlight an important point here."
          : "Section divider.",
    };

    setBlocks((prev) => [...prev, block]);
    setSelectedHeaderField(null);
    setSelectedBlockId(block.id);

    setTimeout(() => scrollToBlock(block), 50);
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
  };

  const deleteSelectedBlock = () => {
    if (!selectedBlock || selectedBlock.kind === "section") return;
    setBlocks((prev) => prev.filter((block) => block.id !== selectedBlock.id));
    setSelectedBlockId("problem");
  };

  const copySelectedContent = async () => {
    const text = selectedHeaderField
      ? posterHeader[selectedHeaderField]
      : selectedBlock?.content ?? "";

    try {
      await navigator.clipboard.writeText(text);
      setSavedStatus("Copied.");
      setTimeout(() => setSavedStatus(""), 1500);
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

      if (selectedBlock) {
        updateBlock(selectedBlock.id, { content: text });
      }
    } catch {
      setReviewText("Paste failed. Please paste manually.");
    }
  };
    const importFromStudios = () => {
    const importedObjects = readAllStudioObjects();
    importObjects(importedObjects);

    const posterContent = buildPosterContent(importedObjects);

    const smartContent = {
      problem:
        posterContent.problem ||
        "Summarize the main problem statement, root causes, and HMW question from the Problem Studio.",
      evidence:
        posterContent.evidence ||
        "Add the strongest statistics, evidence cards, and sources from the Problem Studio.",
      population:
        posterContent.population ||
        "Summarize affected users, personas, and user journey insights.",
      stakeholders:
        posterContent.stakeholders ||
        "Summarize key stakeholders, system actors, power relationships, and system barriers.",
      solution:
        posterContent.solution ||
        "Summarize the selected solution, theory of change, and why this option was prioritized.",
      journey:
        posterContent.population ||
        "Describe the user pathway from problem experience to service engagement and improved outcomes.",
      implementation:
        posterContent.implementation ||
        "Summarize implementation phases, owners, resources, and key activities.",
      risks:
        posterContent.risks ||
        "Summarize implementation risks, barriers, and mitigation strategies.",
      indicators:
        posterContent.indicators ||
        "Summarize monitoring indicators, targets, dashboard ideas, and data sources.",
      timeline:
        posterContent.implementation ||
        "Summarize the timeline from preparation to pilot, scale-up, and sustainability.",
      funding:
        posterContent.implementation ||
        "Summarize budget, funding, ownership, and resource needs.",
      partners:
        posterContent.stakeholders ||
        "Summarize partners, collaborators, institutions, and team information.",
    };

    setBlocks((prev) =>
      prev.map((block) => ({
        ...block,
        content:
          smartContent[block.id as keyof typeof smartContent] || block.content,
      }))
    );

    setReviewText(
      "Imported and organized content from previous studios. Please review each section for clarity, flow, and visual balance."
    );
    setSavedStatus("");
  };

  const savePoster = () => {
    localStorage.setItem(
      POSTER_STORAGE_KEY,
      JSON.stringify({
        posterHeader,
        blocks,
        savedAt: new Date().toISOString(),
      })
    );

    setSavedStatus("Poster saved successfully.");
    setReviewText("Poster saved successfully.");
    setTimeout(() => setSavedStatus(""), 2500);
  };

 const applyPosterLayout = (layout: "academic" | "story" | "dashboard") => {
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

  setReviewText(`Applied ${layout} poster layout.`);
};

const generateLayouts = () => {
  setLayoutSuggestions([
    "Academic Conference Layout",
    "Storytelling / User Journey Layout",
    "Dashboard Policy Layout",
  ]);
};

  const reviewPoster = () => {
    setReviewText(
      "AI Review: Check that the problem is specific, evidence supports the claim, the solution links to root causes, implementation has owners and timeline, and indicators are measurable."
    );
  };

  const resetPosterLayout = () => {
    setPosterHeader(initialHeader);
    setBlocks(initialBlocks);
    setSelectedBlockId("problem");
    setSelectedHeaderField(null);
    localStorage.removeItem(POSTER_STORAGE_KEY);
    setSavedStatus("Poster layout reset.");
    setTimeout(() => setSavedStatus(""), 2500);
  };
  return (
    <main className="page">
      <section
        className="panelCard"
        style={{
          padding: 26,
          marginBottom: 16,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          gap: 24,
          alignItems: "center",
        }}
      >
        <div>
          <div className="fieldNote" style={{ fontWeight: 800 }}>
            POLICY LAB STUDIO
          </div>

          <h1 style={{ marginBottom: 6 }}>Poster Studio</h1>

          <p className="hero-subtitle" style={{ marginBottom: 0 }}>
            Convert your policy work into a professional conference poster.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
  <Link href="/dashboard" className="button secondaryButton">
    Dashboard
  </Link>

  <Link href="/implementation" className="button secondaryButton">
    Previous Studio
  </Link>

  <Link href="/presentation" className="button secondaryButton">
    Next Studio
  </Link>

  <button
    className="button secondaryButton"
    type="button"
    onClick={() =>
      alert("Preview mode will show the final poster without editing panels.")
    }
  >
    Preview
  </button>

  <button
    className="button"
    type="button"
    onClick={() =>
      alert("Export will be connected later for PDF/PNG download.")
    }
  >
    Export
  </button>
</div>
</section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "240px minmax(0, 1fr) 240px",
          gap: 12,
          alignItems: "stretch",
          height: 760,
        }}
      >
        <aside
          className="panelCard"
          style={{
            height: "760px",
            overflowY: "auto",
            overflowX: "hidden",
            padding: 16,
          }}
        >
          <div className="panelHeader">
            <h2>Poster Elements</h2>
            <p className="fieldNote">Navigate, edit, or add poster elements.</p>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div
              className="fieldNote"
              style={{ fontWeight: 900, marginBottom: 10 }}
            >
              POSTER SECTIONS
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {posterSections.map(([id, title, note]) => {
                const target =
                  id === "header"
                    ? undefined
                    : id === "team"
                    ? blocks.find((block) => block.id === "partners")
                    : blocks.find((block) => block.id === id);

                const active =
                  (id === "header" && selectedHeaderField) ||
                  target?.id === selectedBlockId;

                return (
                  <button
                    key={id}
                    type="button"
                    className="panelHint"
                    style={{
                      textAlign: "left",
                      cursor: "pointer",
                      border: active
                        ? "3px solid #0f2f66"
                        : "1px solid #e5e7eb",
                      background: active ? "#eef4ff" : "#fff",
                    }}
                    onClick={() => {
                      if (id === "header") {
                        scrollToHeader("title");
                        return;
                      }

                      if (target) scrollToBlock(target);
                    }}
                  >
                    <strong>
                      {id === "header" ? "✓" : getBlockStatus(target)} {title}
                    </strong>
                    <p className="fieldNote" style={{ marginBottom: 0 }}>
                      {note}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div
              className="fieldNote"
              style={{ fontWeight: 900, marginBottom: 10 }}
            >
              VISUAL ELEMENTS
            </div>

            <div style={{ display: "grid", gap: 8 }}>
              {visualElements.map(([id, title, note]) => (
                <button
                  key={id}
                  type="button"
                  className="panelHint"
                  style={{
                    textAlign: "left",
                    cursor: "pointer",
                    border: "1px solid #e5e7eb",
                    background: "#fff",
                  }}
                  onClick={() => addVisualElement(id as PosterBlockKind)}
                >
                  <strong>+ {title}</strong>
                  <p className="fieldNote" style={{ marginBottom: 0 }}>
                    {note}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section
          className="panelCard"
          style={{
            padding: 0,
            overflow: "hidden",
            height: "760px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="panelHeader"
            style={{
              padding: 14,
              borderBottom: "1px solid rgba(15, 47, 102, 0.12)",
              marginBottom: 0,
            }}
          >
            <div>
              <h2>Poster Workspace</h2>
              <p className="fieldNote">
                Select any block, edit it from the right panel, and save your poster.
              </p>
            </div>
          </div>

          <div
            ref={workspaceRef}
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "auto",
              background: "#eef2f7",
              padding: 18,
            }}
          >
            <div
              style={{
                width: 1500,
                minHeight: 2250,
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
              }}
            >
              <div
                style={{
                  width: 1400,
                  minHeight: 2100,
                  background: "#ffffff",
                  border: "1px solid #dbe2ef",
                  boxShadow: "0 20px 50px rgba(15,47,102,.12)",
                  padding: 18,
                }}
              >
                <section
                  style={{
                    background:
                      "linear-gradient(135deg, #06265c 0%, #0f3f88 100%)",
                    color: "#ffffff",
                    borderRadius: 6,
                    padding: 26,
                    display: "grid",
                    gridTemplateColumns: "120px 1fr 180px",
                    alignItems: "center",
                    gap: 18,
                    marginBottom: 14,
                    outline: selectedHeaderField
                      ? "4px solid #f97316"
                      : "none",
                    cursor: "pointer",
                  }}
                  onClick={() => scrollToHeader("title")}
                >
                  <div
                    style={{
                      width: 92,
                      height: 92,
                      borderRadius: "50%",
                      border: "3px solid rgba(255,255,255,.8)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 42,
                    }}
                    onClick={(event) => {
                      event.stopPropagation();
                      scrollToHeader("logo");
                    }}
                  >
                    {posterHeader.logo}
                  </div>

                  <div>
                    <h1
                      style={{ color: "#ffffff", marginBottom: 6 }}
                      onClick={(event) => {
                        event.stopPropagation();
                        scrollToHeader("title");
                      }}
                    >
                      {posterHeader.title}
                    </h1>
                    <p
                      style={{ marginBottom: 0 }}
                      onClick={(event) => {
                        event.stopPropagation();
                        scrollToHeader("subtitle");
                      }}
                    >
                      {posterHeader.subtitle}
                    </p>
                  </div>

                  <div
                    style={{ textAlign: "right", fontWeight: 700 }}
                    onClick={(event) => {
                      event.stopPropagation();
                      scrollToHeader("team");
                    }}
                  >
                    {posterHeader.team}
                    <br />
                    {posterHeader.course}
                    <br />
                    {posterHeader.instructor}
                  </div>
                </section>

                <section
                  style={{
                    position: "relative",
                    width: "100%",
                    minHeight: 1650,
                  }}
                >
                  {blocks.map((block) => (
                    <article
                      key={block.id}
                      onClick={() => {
                        setSelectedHeaderField(null);
                        setSelectedBlockId(block.id);
                      }}
                      style={{
                        border:
                          selectedBlockId === block.id && !selectedHeaderField
                            ? `3px solid ${block.accent}`
                            : "1px solid #d8e0ee",
                        borderRadius: block.kind === "divider" ? 4 : 8,
                        padding: block.kind === "divider" ? 10 : 14,
                        position: "absolute",
                        left: block.x,
                        top: block.y,
                        width: block.width,
                        height: block.height,
                        overflow: "hidden",
                        background:
                          block.kind === "callout"
                            ? "#fff7ed"
                            : block.kind === "divider"
                            ? "#f8fafc"
                            : "#ffffff",
                        cursor: "pointer",
                        transition: "all .15s ease",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: block.kind === "divider" ? 0 : 10,
                        }}
                      >
                        <span
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            background: block.accent,
                            color: "#ffffff",
                            display: "grid",
                            placeItems: "center",
                            fontWeight: 900,
                          }}
                        >
                          {block.number}
                        </span>

                        <strong style={{ color: "#0f2f66" }}>
                          {block.title.toUpperCase()}
                        </strong>
                      </div>

                      {block.kind === "image" ? (
                        <div
                          style={{
                            border: "2px dashed #b8c7dc",
                            height: "calc(100% - 52px)",
                            display: "grid",
                            placeItems: "center",
                            textAlign: "center",
                            padding: 10,
                            color: "#334155",
                          }}
                        >
                          {block.content}
                        </div>
                      ) : block.kind === "chart" ? (
                        <div>
                          <p style={{ marginBottom: 10 }}>{block.content}</p>
                          <div
                            style={{
                              height: 70,
                              display: "grid",
                              gridTemplateColumns: "repeat(4, 1fr)",
                              alignItems: "end",
                              gap: 8,
                            }}
                          >
                            {[40, 70, 50, 90].map((height, index) => (
                              <div
                                key={index}
                                style={{
                                  height,
                                  background: block.accent,
                                  borderRadius: 6,
                                  opacity: 0.85,
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      ) : block.kind === "icon" ? (
                        <div
                          style={{
                            display: "grid",
                            placeItems: "center",
                            height: "calc(100% - 52px)",
                            textAlign: "center",
                          }}
                        >
                          <div style={{ fontSize: 44 }}>◆</div>
                          <p style={{ marginBottom: 0 }}>{block.content}</p>
                        </div>
                      ) : block.kind === "divider" ? (
                        <div
                          style={{
                            height: 5,
                            background: block.accent,
                            borderRadius: 999,
                            marginTop: 8,
                          }}
                        />
                      ) : (
                        <p style={{ lineHeight: 1.55, marginBottom: 0 }}>
                          {block.content}
                        </p>
                      )}
                    </article>
                  ))}
                </section>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: 10,
              borderTop: "1px solid rgba(15,47,102,0.12)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              background: "#ffffff",
            }}
          >
            <button
              type="button"
              className="button secondaryButton"
              onClick={() => setZoom((prev) => Math.max(0.35, prev - 0.08))}
            >
              −
            </button>

            <span
              className="panelHint"
              style={{ padding: "8px 12px", fontWeight: 800 }}
            >
              {Math.round(zoom * 100)}%
            </span>

            <button
              type="button"
              className="button secondaryButton"
              onClick={() => setZoom((prev) => Math.min(1.2, prev + 0.08))}
            >
              +
            </button>

            <button
              type="button"
              className="button secondaryButton"
              onClick={() => setZoom(0.58)}
            >
              Fit
            </button>

            <button
              type="button"
              className="button secondaryButton"
              onClick={() => setZoom(1)}
            >
              100%
            </button>

            <button
              type="button"
              className="button secondaryButton"
              onClick={resetPosterLayout}
            >
              Reset Layout
            </button>
          </div>
        </section>

        <aside
          className="panelCard"
          style={{
            height: "760px",
            overflowY: "auto",
            overflowX: "hidden",
            padding: 16,
            display: "grid",
            gap: 14,
            alignContent: "start",
          }}
        >
          <div className="panelHeader">
            <h2>AI Assistant</h2>
            <p className="fieldNote">Generate layouts and review poster.</p>
          </div>

          <div className="panelHint">
            <strong>AI Poster Generator</strong>
            <p className="fieldNote">
              Describe your poster and get 3–4 layout suggestions.
            </p>

            <textarea
              rows={5}
              value={aiPrompt}
              onChange={(event) => setAiPrompt(event.target.value)}
              placeholder="e.g. Clean layout with icons, evidence at top, timeline at bottom..."
            />

            <button
              type="button"
              className="button"
              onClick={generateLayouts}
              style={{ marginTop: 10, width: "100%" }}
            >
              Generate Layouts
            </button>
          </div>

          <div className="panelHint">
            <strong>Suggested Layouts</strong>

            {layoutSuggestions.length === 0 ? (
              <p className="fieldNote" style={{ marginBottom: 0 }}>
                Layout suggestions will appear here.
              </p>
            ) : (
              <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
  {layoutSuggestions.map((layout, index) => {
    const layoutType =
      index === 0
        ? "academic"
        : index === 1
        ? "story"
        : "dashboard";

    return (
      <div key={layout} className="panelHint">
        <strong>{layout}</strong>

        <p
          className="fieldNote"
          style={{ marginBottom: 10 }}
        >
          Click below to rearrange your poster using this layout.
        </p>

        <button
          type="button"
          className="button secondaryButton"
          style={{ width: "100%" }}
          onClick={() =>
            applyPosterLayout(
              layoutType as "academic" | "story" | "dashboard"
            )
          }
        >
          Apply Layout
        </button>
      </div>
    );
  })}
              </div>
            )}
          </div>

          <button
            type="button"
            className="button secondaryButton"
            onClick={reviewPoster}
          >
            Review My Poster
          </button>

          {reviewText ? (
            <div className="panelHint">
              <strong>AI Poster Review</strong>
              <p className="fieldNote" style={{ marginBottom: 0 }}>
                {reviewText}
              </p>
            </div>
          ) : null}

          <div className="panelHint">
            <strong>
              {selectedHeaderField ? "Header Editor" : "Element Editor"}
            </strong>
            <p className="fieldNote" style={{ marginBottom: 0 }}>
              {selectedHeaderField
                ? `Editing: ${selectedHeaderField}`
                : selectedBlock?.title}
            </p>
          </div>

          {selectedHeaderField ? (
            <div style={{ display: "grid", gap: 10 }}>
              <label className="fieldLabel">
                <span>Logo / Icon</span>
                <input
                  value={posterHeader.logo}
                  onChange={(event) => updateHeader({ logo: event.target.value })}
                />
              </label>

              <label className="fieldLabel">
                <span>Poster Title</span>
                <textarea
                  rows={3}
                  value={posterHeader.title}
                  onChange={(event) =>
                    updateHeader({ title: event.target.value })
                  }
                />
              </label>

              <label className="fieldLabel">
                <span>Subtitle</span>
                <textarea
                  rows={4}
                  value={posterHeader.subtitle}
                  onChange={(event) =>
                    updateHeader({ subtitle: event.target.value })
                  }
                />
              </label>

              <label className="fieldLabel">
                <span>Team</span>
                <input
                  value={posterHeader.team}
                  onChange={(event) => updateHeader({ team: event.target.value })}
                />
              </label>

              <label className="fieldLabel">
                <span>Course</span>
                <input
                  value={posterHeader.course}
                  onChange={(event) =>
                    updateHeader({ course: event.target.value })
                  }
                />
              </label>

              <label className="fieldLabel">
                <span>Instructor</span>
                <input
                  value={posterHeader.instructor}
                  onChange={(event) =>
                    updateHeader({ instructor: event.target.value })
                  }
                />
              </label>
            </div>
          ) : selectedBlock ? (
            <div style={{ display: "grid", gap: 10 }}>
              <label className="fieldLabel">
                <span>Title</span>
                <input
                  value={selectedBlock.title}
                  onChange={(event) =>
                    updateBlock(selectedBlock.id, { title: event.target.value })
                  }
                />
              </label>

              <label className="fieldLabel">
                <span>Type / Caption</span>
                <input
                  value={selectedBlock.type}
                  onChange={(event) =>
                    updateBlock(selectedBlock.id, { type: event.target.value })
                  }
                />
              </label>

              <label className="fieldLabel">
                <span>Content</span>
                <textarea
                  rows={8}
                  value={selectedBlock.content}
                  onChange={(event) =>
                    updateBlock(selectedBlock.id, {
                      content: event.target.value,
                    })
                  }
                />
              </label>

              <button
                type="button"
                className="button secondaryButton"
                onClick={duplicateSelectedBlock}
              >
                Duplicate Element
              </button>

              <button
                type="button"
                className="button secondaryButton"
                onClick={deleteSelectedBlock}
                disabled={selectedBlock.kind === "section"}
              >
                Delete Visual Element
              </button>
            </div>
          ) : null}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
            }}
          >
            <button
              type="button"
              className="button secondaryButton"
              onClick={copySelectedContent}
            >
              Copy
            </button>

            <button
              type="button"
              className="button secondaryButton"
              onClick={pasteIntoSelected}
            >
              Paste
            </button>
          </div>

          <div className="panelHint">
            <strong>Poster Progress</strong>
            <p className="fieldNote" style={{ marginBottom: 0 }}>
              {completedCount}/{blocks.length} sections/elements completed
            </p>
          </div>

          {savedStatus ? (
            <div className="savedBanner" style={{ marginTop: 0 }}>
              {savedStatus}
            </div>
          ) : null}

          <button
            type="button"
            className="button secondaryButton"
            onClick={importFromStudios}
          >
            Import from Studios
          </button>

          <button type="button" className="button" onClick={savePoster}>
            Save Poster
          </button>
        </aside>
      </section>
    </main>
  );
}