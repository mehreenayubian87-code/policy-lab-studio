"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type {
  ObjectType,
  StudioConfig,
  StudioObject,
  StudioConnection,
} from "./types";
import { objectPresets } from "./objectPresets";
import IconLibrary from "./IconLibrary";
import StudioObjectCard from "./StudioObjectCard";

export default function StudioEngine({ config }: { config: StudioConfig }) {
  const [objects, setObjects] = useState<StudioObject[]>([]);
  const [connections, setConnections] = useState<StudioConnection[]>([]);
const [connectionFromId, setConnectionFromId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [zoom, setZoom] = useState(1);
  const [saved, setSaved] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [studentName, setStudentName] = useState("");
  const [profQuestion, setProfQuestion] = useState("");
  const [feedbackStatus, setFeedbackStatus] = useState("Not started");
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(config.toolGroups.map((group) => [group.title, !group.collapsed]))
  );

  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const panState = useRef({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

  const SNAP_SIZE = 28;
  const WORKSPACE_WIDTH = 6000;
  const WORKSPACE_HEIGHT = 4200;

  const snapToGrid = (value: number) => Math.round(value / SNAP_SIZE) * SNAP_SIZE;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(config.storageKey);

      if (raw) {
        const data = JSON.parse(raw);

        if (Array.isArray(data.objects)) {
          setObjects(data.objects);
          setSelectedId(data.objects[0]?.id ?? null);
        }
        if (Array.isArray(data.connections)) {
  setConnections(data.connections);
}

        if (typeof data.zoom === "number") setZoom(data.zoom);
        if (data.checklistState) setChecklistState(data.checklistState);
      } else {
    if (config.studioId === "problem") {
        createGuidanceCards();
    }
}
    } catch (error) {
      console.error(error);
    }
  }, []);

  const selectedObject = useMemo(
    () => objects.find((object) => object.id === selectedId) ?? null,
    [objects, selectedId]
  );

  const handleSelectObject = (id: string, multiSelect: boolean) => {
  setSelectedId(id);

  if (multiSelect) {
    setSelectedIds((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    );
  } else {
    setSelectedIds([id]);
  }
};
const selectedObjects = objects.filter((object) =>
  selectedIds.includes(object.id)
);

const alignSelected = (mode: "left" | "right" | "top" | "bottom") => {
  if (selectedObjects.length < 2) return;

  const left = Math.min(...selectedObjects.map((object) => object.x));
  const right = Math.max(
    ...selectedObjects.map((object) => object.x + object.width)
  );
  const top = Math.min(...selectedObjects.map((object) => object.y));
  const bottom = Math.max(
    ...selectedObjects.map((object) => object.y + object.height)
  );

  setObjects((prev) =>
    prev.map((object) => {
      if (!selectedIds.includes(object.id)) return object;

      if (mode === "left") return { ...object, x: left };
      if (mode === "right") return { ...object, x: right - object.width };
      if (mode === "top") return { ...object, y: top };
      return { ...object, y: bottom - object.height };
    })
  );
};

const distributeSelected = (direction: "horizontal" | "vertical") => {
  if (selectedObjects.length < 3) return;

  const sorted = [...selectedObjects].sort((a, b) =>
    direction === "horizontal" ? a.x - b.x : a.y - b.y
  );

  const first = sorted[0];
  const last = sorted[sorted.length - 1];

  const totalSize = sorted.reduce(
    (sum, object) =>
      sum + (direction === "horizontal" ? object.width : object.height),
    0
  );

  const totalRange =
    direction === "horizontal"
      ? last.x + last.width - first.x
      : last.y + last.height - first.y;

  const gap = (totalRange - totalSize) / (sorted.length - 1);

  let cursor = direction === "horizontal" ? first.x : first.y;
  const updates: Record<string, number> = {};

  sorted.forEach((object) => {
    updates[object.id] = cursor;
    cursor +=
      (direction === "horizontal" ? object.width : object.height) + gap;
  });

  setObjects((prev) =>
    prev.map((object) =>
      selectedIds.includes(object.id)
        ? direction === "horizontal"
          ? { ...object, x: snapToGrid(updates[object.id]) }
          : { ...object, y: snapToGrid(updates[object.id]) }
        : object
    )
  );
};
  const gridPosition = (index: number) => {
    const col = index % 4;
    const row = Math.floor(index / 4);

    return {
      x: snapToGrid(60 + col * 380),
      y: snapToGrid(70 + row * 260),
    };
  };

  const overlaps = (
    a: { x: number; y: number; width: number; height: number },
    b: { x: number; y: number; width: number; height: number }
  ) => {
    return !(
      a.x + a.width + 24 < b.x ||
      b.x + b.width + 24 < a.x ||
      a.y + a.height + 24 < b.y ||
      b.y + b.height + 24 < a.y
    );
  };

  const findOpenPosition = (width: number, height: number) => {
    for (let row = 0; row < 40; row++) {
      for (let col = 0; col < 12; col++) {
        const candidate = {
          x: snapToGrid(60 + col * 380),
          y: snapToGrid(70 + row * 260),
          width,
          height,
        };

        if (!objects.some((object) => overlaps(candidate, object))) {
          return { x: candidate.x, y: candidate.y };
        }
      }
    }

    return {
      x: snapToGrid(60),
      y: snapToGrid(70 + objects.length * 260),
    };
  };

  const addObject = (type: ObjectType, extra?: Partial<StudioObject>) => {
    const preset = objectPresets[type];
    const position = findOpenPosition(preset.width, preset.height);

    const object: StudioObject = {
      id: `${type}-${Date.now()}`,
      ...preset,
      x: position.x,
      y: position.y,
      createdIn: config.studioId,
      ...extra,
    };

    setObjects((prev) => [...prev, object]);
    setSelectedId(object.id);
  };

  const createGuidanceCards = () => {
    const cards = config.guidanceCards.map((card, index): StudioObject => {
      const type = card.objectType ?? "sticky";
      const preset = objectPresets[type];

      return {
        id: `guidance-${index}-${Date.now()}`,
        ...preset,
        type,
        title: card.title,
        content: card.prompt,
        x: snapToGrid(60 + (index % 2) * 520),
        y: snapToGrid(70 + Math.floor(index / 2) * 260),
        width: type === "sticky" ? 340 : preset.width,
        height: type === "sticky" ? 180 : preset.height,
        createdIn: config.studioId,
      };
    });

    setObjects(cards);
    setSelectedId(cards[0]?.id ?? null);
  };

  const updateObject = (id: string, changes: Partial<StudioObject>) => {
    setObjects((prev) =>
      prev.map((object) => (object.id === id ? { ...object, ...changes } : object))
    );
  };

 const deleteObject = (id: string) => {
  setObjects((prev) => prev.filter((object) => object.id !== id));
  setConnections((prev) =>
    prev.filter((connection) => connection.fromId !== id && connection.toId !== id)
  );
  setSelectedId(null);
  setConnectionFromId(null);
};

const startConnection = (id: string) => {
  setConnectionFromId(id);
};

const completeConnection = (toId: string) => {
  if (!connectionFromId || connectionFromId === toId) return;

  const alreadyExists = connections.some(
    (connection) =>
      connection.fromId === connectionFromId && connection.toId === toId
  );

  if (alreadyExists) {
    setConnectionFromId(null);
    return;
  }

  const newConnection: StudioConnection = {
    id: `connection-${Date.now()}`,
    fromId: connectionFromId,
    toId,
    label: "related to",
    type: "related to",
  };

  setConnections((prev) => [...prev, newConnection]);
  setConnectionFromId(null);
};

const updateConnection = (
  id: string,
  changes: Partial<StudioConnection>
) => {
  setConnections((prev) =>
    prev.map((connection) =>
      connection.id === id ? { ...connection, ...changes } : connection
    )
  );
};

const deleteConnection = (id: string) => {
  setConnections((prev) =>
    prev.filter((connection) => connection.id !== id)
  );
};

  const duplicateObject = (id: string) => {
    const object = objects.find((item) => item.id === id);
    if (!object) return;

    const copy: StudioObject = {
      ...object,
      id: `${object.type}-${Date.now()}`,
      title: `${object.title} Copy`,
      x: snapToGrid(object.x + 42),
      y: snapToGrid(object.y + 42),
      locked: false,
    };

    setObjects((prev) => [...prev, copy]);
    setSelectedId(copy.id);
  };

  const arrangeObjects = () => {
    setObjects((prev) =>
      prev.map((object, index) => ({
        ...object,
        ...gridPosition(index),
      }))
    );
  };

  const generateAIVisual = () => {
    const prompt = aiPrompt.trim();

    addObject("aiVisual", {
      title: prompt ? "AI Visual: " + prompt.slice(0, 34) : "AI Visual",
      content: prompt
        ? `AI visual placeholder generated from prompt: "${prompt}". Later this will create a real graph, map, persona, matrix, timeline, or infographic.`
        : "AI visual placeholder. Add a prompt first.",
      width: 430,
      height: 260,
      color: "#ccfbf1",
      icon: "✨",
    });

    setAiPrompt("");
  };

  const saveProgress = () => {
    localStorage.setItem(
      config.storageKey,
      JSON.stringify({
      objects,
connections,
zoom,
checklistState,
savedAt: new Date().toISOString(),
      })
    );

    setSaved("Progress saved.");
    setTimeout(() => setSaved(""), 2000);
  };

  const resetCanvas = () => {
    localStorage.removeItem(config.storageKey);
    setObjects([]);
    setConnections([]);
    setSelectedId(null);
    setZoom(1);
    setTimeout(createGuidanceCards, 0);
  };

  const completedChecklist = config.checklist.filter((item) => checklistState[item]).length;
const selectedObjectConnections = selectedObject
  ? connections.filter(
      (connection) =>
        connection.fromId === selectedObject.id ||
        connection.toId === selectedObject.id
    )
  : [];
  return (
    <main className="page">
      <section
        className="panelCard"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 0.8fr)",
          gap: 24,
          alignItems: "center",
          padding: 26,
          marginBottom: 16,
        }}
      >
        <div>
          <h1 style={{ marginBottom: 8 }}>{config.title}</h1>
          <h2
            style={{
              fontSize: "1.6rem",
              fontWeight: 600,
              color: "#42526b",
              marginBottom: 12,
              lineHeight: 1.25,
            }}
          >
            {config.subtitle}
          </h2>
          <p className="hero-subtitle" style={{ marginBottom: 0 }}>
            Use the toolbox, policy workspace, AI facilitator, professor feedback,
            checklist, and resources together.
          </p>
        </div>

        <div className="panelHint" style={{ display: "grid", gap: 10 }}>
          <strong>Studio Navigation</strong>
          <div
            className="actionRow"
            style={{
              justifyContent: "flex-start",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <Link className="button secondaryButton" href={config.previousHref}>
              Previous
            </Link>
            <Link className="button secondaryButton" href={config.dashboardHref}>
              Dashboard
            </Link>
            <Link className="button" href={config.nextHref}>
              Next
            </Link>
            <button type="button" className="button" onClick={saveProgress}>
              Save
            </button>
          </div>

          {saved ? (
            <div className="savedBanner" style={{ marginTop: 0 }}>
              {saved}
            </div>
          ) : null}
        </div>
      </section>

      <div
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
            <h3>Toolbox</h3>
            <p className="fieldNote">Add policy objects.</p>
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {config.toolGroups.map((group) => {
              const open = openGroups[group.title];

              return (
                <div key={group.title} className="panelHint" style={{ padding: 10 }}>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenGroups((prev) => ({
                        ...prev,
                        [group.title]: !prev[group.title],
                      }))
                    }
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "#0f2f66",
                      fontWeight: 900,
                      cursor: "pointer",
                      padding: 0,
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    {open ? "▾" : "▸"} {group.title}
                  </button>

                  {open ? (
                    <div style={{ display: "grid", gap: 7, marginTop: 8 }}>
                      {group.tools.map((tool) => (
                        <button
                          key={`${group.title}-${tool.type}-${tool.label}`}
                          type="button"
                          className="button secondaryButton"
                          onClick={() => addObject(tool.type)}
                          style={{
                            justifyContent: "flex-start",
                            padding: "8px 10px",
                          }}
                        >
                          + {tool.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}

            <div className="panelHint" style={{ padding: 10 }}>
              <button
                type="button"
                className="button secondaryButton"
                onClick={createGuidanceCards}
                style={{ width: "100%" }}
              >
                + Guidance Cards
              </button>
            </div>

            <div className="panelHint" style={{ padding: 10 }}>
              <strong>AI Visual</strong>
              <textarea
                rows={3}
                value={aiPrompt}
                onChange={(event) => setAiPrompt(event.target.value)}
                placeholder="Prompt AI visual..."
              />
              <button
                type="button"
                className="button"
                onClick={generateAIVisual}
                style={{ marginTop: 8 }}
              >
                Generate
              </button>
            </div>

            <IconLibrary
              onAddIcon={(icon) =>
                addObject("icon", {
                  title: "Icon",
                  content: icon,
                  icon,
                  width: 120,
                  height: 120,
                  color: "#f8fafc",
                })
              }
            />
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
              <h2>Policy Workspace</h2>
              <p className="fieldNote">
                Drag, resize, duplicate, delete, recolor, zoom, arrange, and save objects.
              </p>
            </div>
          </div>

          <div
            ref={workspaceRef}
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "auto",
              background: "#f8fafc",
              position: "relative",
              cursor: panState.current.active ? "grabbing" : "default",
            }}
            onWheel={(event) => {
              if (!event.ctrlKey) return;
              event.preventDefault();

              setZoom((prev) => {
                const direction = event.deltaY > 0 ? -0.08 : 0.08;
                const next = Math.min(2.2, Math.max(0.45, prev + direction));
                return Math.round(next * 100) / 100;
              });
            }}
            onPointerDown={(event) => {
              if (!event.nativeEvent.getModifierState("Space")) return;
              event.preventDefault();

              const workspace = workspaceRef.current;
              if (!workspace) return;

              panState.current = {
                active: true,
                startX: event.clientX,
                startY: event.clientY,
                scrollLeft: workspace.scrollLeft,
                scrollTop: workspace.scrollTop,
              };

              workspace.setPointerCapture(event.pointerId);
            }}
            onPointerMove={(event) => {
              if (!panState.current.active) return;

              const workspace = workspaceRef.current;
              if (!workspace) return;

              const dx = event.clientX - panState.current.startX;
              const dy = event.clientY - panState.current.startY;

              workspace.scrollLeft = panState.current.scrollLeft - dx;
              workspace.scrollTop = panState.current.scrollTop - dy;
            }}
            onPointerUp={(event) => {
              if (!panState.current.active) return;

              panState.current.active = false;

              const workspace = workspaceRef.current;
              workspace?.releasePointerCapture(event.pointerId);
            }}
            onClick={() => {
  setSelectedId(null);
  setSelectedIds([]);
}}
          >
            <div
              style={{
                width: WORKSPACE_WIDTH,
                height: WORKSPACE_HEIGHT,
                transform: `scale(${zoom})`,
                transformOrigin: "0 0",
                position: "relative",
                background:
                  "linear-gradient(rgba(15,47,102,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,47,102,0.05) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            >
              <svg
  style={{
    position: "absolute",
    left: 0,
    top: 0,
    width: WORKSPACE_WIDTH,
    height: WORKSPACE_HEIGHT,
    pointerEvents: "none",
    zIndex: 1,
  }}
>
  <defs>
    <marker
      id="arrow"
      markerWidth="10"
      markerHeight="10"
      refX="8"
      refY="3"
      orient="auto"
      markerUnits="strokeWidth"
    >
      <path d="M0,0 L0,6 L9,3 z" fill="#0f2f66" />
    </marker>
  </defs>

  {connections.map((connection) => {
    const from = objects.find((object) => object.id === connection.fromId);
    const to = objects.find((object) => object.id === connection.toId);

    if (!from || !to) return null;

    const x1 = from.x + from.width / 2;
    const y1 = from.y + from.height / 2;
    const x2 = to.x + to.width / 2;
    const y2 = to.y + to.height / 2;

    return (
      <g key={connection.id}>
        <line
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#0f2f66"
          strokeWidth="3"
          markerEnd="url(#arrow)"
          opacity="0.75"
        />

        <text
  x={(x1 + x2) / 2}
  y={(y1 + y2) / 2 - 10}
  fill="#0f2f66"
  fontSize="13"
  fontWeight="700"
  textAnchor="middle"
  style={{
    paintOrder: "stroke",
    stroke: "white",
    strokeWidth: 5,
  }}
>
  {connection.type}
</text>
      </g>
    );
  })}
</svg>
              {objects.map((object) => (
                <StudioObjectCard
                  key={object.id}
                  object={object}
                  selected={selectedIds.includes(object.id)}
                  connectionStart={connectionFromId === object.id}
                  zoom={zoom}
                  snapToGrid={snapToGrid}
                  onSelect={handleSelectObject}
                  onUpdate={updateObject}
                  onDelete={deleteObject}
                  onDuplicate={duplicateObject}
                />
              ))}
            </div>
          </div>

          <div
            style={{
              padding: 10,
              borderTop: "1px solid rgba(15,47,102,0.12)",
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <button type="button" className="button secondaryButton" onClick={() => addObject("sticky")}>
              + Sticky
            </button>
            <button type="button" className="button secondaryButton" onClick={() => addObject("evidence")}>
              + Evidence
            </button>
            <button type="button" className="button secondaryButton" onClick={() => addObject("chart")}>
              + Chart
            </button>
            <button type="button" className="button secondaryButton" onClick={arrangeObjects}>
              Arrange
            </button>
            <button type="button" className="button secondaryButton" onClick={() => alignSelected("left")}>
  Align L
</button>

<button type="button" className="button secondaryButton" onClick={() => alignSelected("top")}>
  Align T
</button>

<button type="button" className="button secondaryButton" onClick={() => distributeSelected("horizontal")}>
  Distribute H
</button>

<button type="button" className="button secondaryButton" onClick={() => distributeSelected("vertical")}>
  Distribute V
</button>
            <button
            
              type="button"
              className="button secondaryButton"
              onClick={() =>
                setZoom((prev) => Math.max(0.5, Math.round((prev - 0.1) * 10) / 10))
              }
            >
              −
            </button>
            <span className="panelHint" style={{ padding: "8px 12px", fontWeight: 700 }}>
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              className="button secondaryButton"
              onClick={() =>
                setZoom((prev) => Math.min(2, Math.round((prev + 0.1) * 10) / 10))
              }
            >
              +
            </button>
            <button type="button" className="button secondaryButton" onClick={resetCanvas}>
              Reset
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
          }}
        >
          {selectedObject ? (
            <Panel title="Object Inspector">
              <div className="panelHint">
                <strong>{selectedObject.title}</strong>
                <p className="fieldNote" style={{ marginBottom: 0 }}>
                  {selectedObject.type} • {selectedObject.width} × {selectedObject.height}
                </p>
              </div>

              <label className="fieldLabel">
                <span>Title</span>
                <input
                  value={selectedObject.title}
                  onChange={(event) =>
                    updateObject(selectedObject.id, { title: event.target.value })
                  }
                />
              </label>

              <label className="fieldLabel">
                <span>Status</span>
                <select
                  value={selectedObject.status ?? "Draft"}
                  onChange={(event) =>
                    updateObject(selectedObject.id, {
                      status: event.target.value as StudioObject["status"],
                    })
                  }
                >
                  <option>Draft</option>
                  <option>AI Reviewed</option>
                  <option>Professor Reviewed</option>
                  <option>Ready</option>
                </select>
              </label>

              <label className="fieldLabel">
                <span>Colour</span>
                <select
                  value={selectedObject.color}
                  onChange={(event) =>
                    updateObject(selectedObject.id, { color: event.target.value })
                  }
                >
                  <option value="#ffd6d6">Red</option>
                  <option value="#dbeafe">Blue</option>
                  <option value="#fef3c7">Yellow</option>
                  <option value="#e9d5ff">Purple</option>
                  <option value="#dcfce7">Green</option>
                  <option value="#ccfbf1">Teal</option>
                  <option value="#f8fafc">White</option>
                </select>
              </label>

              <label className="fieldLabel">
                <span>AI Hint</span>
                <textarea
                  rows={4}
                  value={selectedObject.aiHint ?? ""}
                  onChange={(event) =>
                    updateObject(selectedObject.id, { aiHint: event.target.value })
                  }
                />
              </label>

              <div className="panelHint">
                <strong>Poster Section</strong>
                <p className="fieldNote" style={{ marginBottom: 0 }}>
                  {selectedObject.posterSection || "Not assigned"}
                </p>
              </div>

              <div className="panelHint">
                <strong>Presentation Section</strong>
                <p className="fieldNote" style={{ marginBottom: 0 }}>
                  {selectedObject.presentationSection || "Not assigned"}
                </p>
              </div>
              <div className="panelHint">
  <strong>Connections</strong>

  {selectedObjectConnections.length === 0 ? (
    <p className="fieldNote" style={{ marginBottom: 0 }}>
      No connections yet.
    </p>
  ) : (
    <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
      {selectedObjectConnections.map((connection) => {
        const connectedObject =
          objects.find((object) =>
            connection.fromId === selectedObject.id
              ? object.id === connection.toId
              : object.id === connection.fromId
          );

        return (
          <div
            key={connection.id}
            className="panelHint"
            style={{ display: "grid", gap: 8 }}
          >
            <p className="fieldNote" style={{ marginBottom: 0 }}>
              {connection.fromId === selectedObject.id ? "To" : "From"}:{" "}
              <strong>{connectedObject?.title ?? "Unknown object"}</strong>
            </p>

            <select
              value={connection.type}
              onChange={(event) =>
                updateConnection(connection.id, {
                  type: event.target.value as StudioConnection["type"],
                  label: event.target.value,
                })
              }
            >
              <option value="related to">related to</option>
              <option value="causes">causes</option>
              <option value="supports">supports</option>
              <option value="blocks">blocks</option>
              <option value="depends on">depends on</option>
              <option value="improves">improves</option>
            </select>

            <button
              type="button"
              className="button secondaryButton"
              onClick={() => deleteConnection(connection.id)}
            >
              Delete Connection
            </button>
          </div>
        );
      })}
    </div>
  )}
</div>
              <div style={{ display: "grid", gap: 8 }}>
  {connectionFromId ? (
    <button
      type="button"
      className="button"
      onClick={() => completeConnection(selectedObject.id)}
    >
      Connect to This Object
    </button>
  ) : (
    <button
      type="button"
      className="button secondaryButton"
      onClick={() => startConnection(selectedObject.id)}
    >
      Start Connection
    </button>
  )}

  <button
    type="button"
    className="button secondaryButton"
    onClick={() => duplicateObject(selectedObject.id)}
  >
    Duplicate Object
  </button>

                <button
                  type="button"
                  className="button secondaryButton"
                  onClick={() =>
                    updateObject(selectedObject.id, {
                      locked: !selectedObject.locked,
                    })
                  }
                >
                  {selectedObject.locked ? "Unlock Object" : "Lock Object"}
                </button>

                <button
                  type="button"
                  className="button secondaryButton"
                  onClick={() =>
                    updateObject(selectedObject.id, {
                      status: "AI Reviewed",
                    })
                  }
                >
                  Mark AI Reviewed
                </button>

                <button
                  type="button"
                  className="button secondaryButton"
                  onClick={() => deleteObject(selectedObject.id)}
                >
                  Delete Object
                </button>
              </div>
            </Panel>
          ) : (
            <>
              <Panel title="AI Facilitator">
                <p className="fieldNote">Active guidance for this studio.</p>

                {config.aiGuidance.map((item) => (
                  <div key={item} className="panelHint">
                    {item}
                  </div>
                ))}

                <div className="panelHint">
                  Please confirm important decisions with your professor.
                </div>
              </Panel>

              <Panel title="Professor Feedback">
                <input
                  value={studentName}
                  onChange={(event) => setStudentName(event.target.value)}
                  placeholder="Student name / Group"
                />

                <textarea
                  rows={4}
                  value={profQuestion}
                  onChange={(event) => setProfQuestion(event.target.value)}
                  placeholder="Write your question for the professor..."
                />

                <select
                  value={feedbackStatus}
                  onChange={(event) => setFeedbackStatus(event.target.value)}
                >
                  <option>Not started</option>
                  <option>In progress</option>
                  <option>Resolved</option>
                </select>

                <button type="button" className="button secondaryButton">
                  Save Feedback
                </button>
              </Panel>

              <Panel title={`Checklist (${completedChecklist}/${config.checklist.length})`}>
                <div style={{ display: "grid", gap: 6 }}>
                  {config.checklist.map((item) => (
                    <label
                      key={item}
                      style={{
                        display: "flex",
                        gap: 6,
                        alignItems: "center",
                        fontSize: ".82rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(checklistState[item])}
                        onChange={() =>
                          setChecklistState((prev) => ({
                            ...prev,
                            [item]: !prev[item],
                          }))
                        }
                        style={{ width: "auto" }}
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </Panel>

              <Panel title="Resources">
                {config.resources.map((resource) => (
                  <div key={resource.title} className="panelHint">
                    <strong>{resource.title}</strong>
                    <p className="fieldNote" style={{ marginBottom: 0 }}>
                      {resource.type}: {resource.note}
                    </p>
                  </div>
                ))}
              </Panel>
            </>
          )}
        </aside>
      </div>
    </main>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="panelHeader">
        <h3>{title}</h3>
      </div>

      <div style={{ display: "grid", gap: 10 }}>{children}</div>
    </div>
  );
}