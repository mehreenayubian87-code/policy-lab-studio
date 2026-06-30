"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import type { CanvasConfig, PolicyObject, PolicyObjectType } from "./types";
import { objectPresets } from "./objectPresets";
import PolicyObjectCard from "./PolicyObjectCard";
import IconLibrary from "./IconLibrary";

type ToolGroup = { title: string; tools: { type: PolicyObjectType; label: string }[] };

const toolGroups: ToolGroup[] = [
  { title: "Problem", tools: [{ type: "problem", label: "Problem Statement" }, { type: "hmw", label: "HMW Question" }] },
  { title: "Evidence", tools: [{ type: "evidence", label: "Evidence Card" }, { type: "statistic", label: "Statistic Card" }] },
  { title: "Analysis", tools: [{ type: "rootCause", label: "Root Cause" }, { type: "problemTree", label: "Problem Tree" }] },
  { title: "Users", tools: [{ type: "persona", label: "Persona" }] },
  { title: "Visuals", tools: [{ type: "sticky", label: "Sticky Note" }, { type: "chart", label: "Chart" }, { type: "aiVisual", label: "AI Visual" }] },
];

const initialObjects: PolicyObject[] = [
  { id: "welcome-problem", type: "problem", title: "Problem Statement", content: "Define the policy problem here. Keep it specific, evidence-informed, and focused on who is affected.", x: 60, y: 70, width: 320, height: 180, color: "#ffd6d6", icon: "🔍" },
  { id: "welcome-evidence", type: "evidence", title: "Evidence Card", content: "Add statistics, literature, reports, or field observations that explain why this problem matters.", x: 420, y: 70, width: 320, height: 180, color: "#dbeafe", icon: "📚" },
  { id: "welcome-hmw", type: "hmw", title: "How Might We", content: "How might we help [user] achieve [goal] despite [barrier]?", x: 780, y: 70, width: 330, height: 170, color: "#fef3c7", icon: "❓" },
];

export default function PolicyCanvas({ config, rightPanel }: { config: CanvasConfig; rightPanel?: ReactNode }) {
  const [objects, setObjects] = useState<PolicyObject[]>(initialObjects);
  const [selectedId, setSelectedId] = useState<string | null>(initialObjects[0].id);
  const [zoom, setZoom] = useState(1);
  const [saved, setSaved] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(config.storageKey);
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data.objects) && data.objects.length > 0) {
          setObjects(data.objects);
          setSelectedId(data.objects[0].id);
        }
        if (typeof data.zoom === "number") setZoom(data.zoom);
      }
    } catch (error) {
      console.error(error);
    }
  }, [config.storageKey]);

  const selectedObject = useMemo(() => objects.find((object) => object.id === selectedId) ?? null, [objects, selectedId]);

  const nextPosition = (index: number) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    return { x: 60 + col * 360, y: 310 + row * 250 };
  };

  const addObject = (type: PolicyObjectType, extra?: Partial<PolicyObject>) => {
    const preset = objectPresets[type];
    const position = nextPosition(objects.length);
    const object: PolicyObject = { id: `${type}-${Date.now()}`, ...preset, x: position.x, y: position.y, ...extra };
    setObjects((prev) => [...prev, object]);
    setSelectedId(object.id);
  };

  const updateObject = (id: string, changes: Partial<PolicyObject>) => {
    setObjects((prev) => prev.map((object) => (object.id === id ? { ...object, ...changes } : object)));
  };

  const deleteObject = (id: string) => {
    setObjects((prev) => prev.filter((object) => object.id !== id));
    setSelectedId(null);
  };

  const duplicateObject = (id: string) => {
    const object = objects.find((item) => item.id === id);
    if (!object) return;
    const copy: PolicyObject = { ...object, id: `${object.type}-${Date.now()}`, title: `${object.title} Copy`, x: object.x + 30, y: object.y + 30 };
    setObjects((prev) => [...prev, copy]);
    setSelectedId(copy.id);
  };

  const arrangeObjects = () => {
    setObjects((prev) => prev.map((object, index) => ({ ...object, ...nextPosition(index) })));
  };

  const resetCanvas = () => {
    setObjects(initialObjects);
    setSelectedId(initialObjects[0].id);
    setZoom(1);
    localStorage.removeItem(config.storageKey);
  };

  const saveCanvas = () => {
    localStorage.setItem(config.storageKey, JSON.stringify({ objects, zoom, savedAt: new Date().toISOString() }));
    setSaved("Progress saved.");
    setTimeout(() => setSaved(""), 2000);
  };

  const generateAIVisual = () => {
    const prompt = aiPrompt.trim();
    addObject("aiVisual", {
      title: prompt ? "AI Visual: " + prompt.slice(0, 36) : "AI Visual",
      content: prompt ? `AI visual placeholder generated from prompt: "${prompt}". Later this will create a real chart, problem tree, persona, or infographic.` : "AI visual placeholder. Add a prompt first for a more specific visual.",
      width: 420,
      height: 260,
      color: "#ccfbf1",
      icon: "✨",
    });
    setAiPrompt("");
  };

  return (
    <main className="page">
      <section className="panelCard" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 0.8fr)", gap: 24, alignItems: "center", padding: 28, marginBottom: 18 }}>
        <div>
          <h1 style={{ marginBottom: 8 }}>{config.studioTitle}</h1>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 600, color: "#42526b", marginBottom: 14, lineHeight: 1.25 }}>{config.studioSubtitle}</h2>
          <p className="hero-subtitle" style={{ marginBottom: 0 }}>
            Add policy objects to the canvas, organize them visually, use AI to create visual placeholders, and prepare content that can later flow into the poster and presentation.
          </p>
        </div>

        <div className="panelHint" style={{ display: "grid", gap: 12 }}>
          <strong>Studio Navigation</strong>
          <div className="actionRow" style={{ justifyContent: "flex-start", gap: 10, flexWrap: "wrap" }}>
            <Link className="button secondaryButton" href={config.previousHref}>Previous Studio</Link>
            <Link className="button secondaryButton" href={config.dashboardHref}>Back to Dashboard</Link>
            <Link className="button" href={config.nextHref}>Next Studio</Link>
            <button type="button" className="button" onClick={saveCanvas}>Save Progress</button>
          </div>
          {saved ? <div className="savedBanner" style={{ marginTop: 0 }}>{saved}</div> : null}
        </div>
      </section>

      <div style={{ display: "grid", gridTemplateColumns: "270px minmax(0, 1fr) 330px", gap: 16, alignItems: "start" }}>
        <aside className="panelCard" style={{ position: "sticky", top: 16 }}>
          <div className="panelHeader">
            <h3>Policy Toolbox</h3>
            <p className="fieldNote">Add objects to the workspace canvas.</p>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {toolGroups.map((group) => (
              <div key={group.title} className="panelHint">
                <strong>{group.title}</strong>
                <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                  {group.tools.map((tool) => (
                    <button key={tool.type} type="button" className="button secondaryButton" onClick={() => addObject(tool.type)} style={{ justifyContent: "flex-start" }}>
                      + {tool.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="panelHint">
              <strong>AI Visual Generator</strong>
              <p className="fieldNote">Prompt AI to create a chart, graph, persona, problem tree, or infographic placeholder.</p>
              <textarea rows={3} value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} placeholder="Example: Create a bar chart showing causes of absenteeism..." />
              <button type="button" className="button" onClick={generateAIVisual} style={{ marginTop: 10 }}>Generate Visual Card</button>
            </div>

            <div className="panelHint">
              <strong>Icon Library</strong>
              <p className="fieldNote">Click an icon to add it to the canvas.</p>
              <IconLibrary onAddIcon={(icon) => addObject("icon", { title: "Icon", content: icon, icon, width: 120, height: 120, color: "#f8fafc" })} />
            </div>
          </div>
        </aside>

        <section className="panelCard" style={{ padding: 0, overflow: "hidden" }}>
          <div className="panelHeader" style={{ padding: 16, borderBottom: "1px solid rgba(15, 47, 102, 0.12)", marginBottom: 0 }}>
            <div>
              <h2>Policy Design Canvas</h2>
              <p className="fieldNote">Zoom, move, resize, duplicate, delete, recolor, and arrange cards. All cards remain visible.</p>
            </div>
          </div>

          <div style={{ height: "760px", overflow: "auto", background: "#f8fafc", position: "relative" }} onClick={() => setSelectedId(null)}>
            <div style={{ width: 1400, height: 1150, transform: `scale(${zoom})`, transformOrigin: "0 0", position: "relative", background: "linear-gradient(rgba(15,47,102,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,47,102,0.05) 1px, transparent 1px)", backgroundSize: "28px 28px" }}>
              {objects.map((object) => (
                <PolicyObjectCard key={object.id} object={object} selected={selectedId === object.id} zoom={zoom} onSelect={setSelectedId} onUpdate={updateObject} onDelete={deleteObject} onDuplicate={duplicateObject} />
              ))}
            </div>
          </div>

          <div style={{ padding: 12, borderTop: "1px solid rgba(15, 47, 102, 0.12)", display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" className="button secondaryButton" onClick={() => addObject("sticky")}>+ Sticky</button>
              <button type="button" className="button secondaryButton" onClick={() => addObject("problem")}>+ Problem</button>
              <button type="button" className="button secondaryButton" onClick={() => addObject("evidence")}>+ Evidence</button>
              <button type="button" className="button secondaryButton" onClick={() => addObject("persona")}>+ Persona</button>
              <button type="button" className="button secondaryButton" onClick={() => addObject("chart")}>+ Chart</button>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button type="button" className="button secondaryButton" onClick={() => setZoom((prev) => Math.max(0.5, Math.round((prev - 0.1) * 10) / 10))}>Zoom -</button>
              <span className="panelHint" style={{ padding: "9px 12px", fontWeight: 800 }}>{Math.round(zoom * 100)}%</span>
              <button type="button" className="button secondaryButton" onClick={() => setZoom((prev) => Math.min(1.6, Math.round((prev + 0.1) * 10) / 10))}>Zoom +</button>
              <button type="button" className="button secondaryButton" onClick={arrangeObjects}>Arrange</button>
              <button type="button" className="button secondaryButton" onClick={resetCanvas}>Reset</button>
            </div>
          </div>
        </section>

        <aside style={{ display: "grid", gap: 16 }}>
          {rightPanel}

          <SidebarPanel title="Selected Object">
            {selectedObject ? (
              <>
                <div className="panelHint">
                  <strong>{selectedObject.title}</strong>
                  <p className="fieldNote" style={{ marginBottom: 0 }}>Type: {selectedObject.type} · Size: {selectedObject.width} × {selectedObject.height}</p>
                </div>
                <button type="button" className="button secondaryButton" onClick={() => duplicateObject(selectedObject.id)}>Duplicate Selected</button>
                <button type="button" className="button secondaryButton" onClick={() => deleteObject(selectedObject.id)}>Delete Selected</button>
              </>
            ) : (
              <p className="fieldNote">Select a card on the canvas.</p>
            )}
          </SidebarPanel>
        </aside>
      </div>
    </main>
  );
}

export function SidebarPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="panelCard">
      <div className="panelHeader"><h3>{title}</h3></div>
      <div style={{ display: "grid", gap: 12 }}>{children}</div>
    </div>
  );
}
