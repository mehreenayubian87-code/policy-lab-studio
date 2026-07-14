"use client";

import StudioResources from "@/components/ResourceHub/StudioResources";
import { useMemo, useRef, useState } from "react";
import { useProject } from "@/components/ProjectState/ProjectProvider";
import StudioShell from "@/components/StudioLayout/StudioShell";
import type {
  ObjectType,
  StudioConfig,
  StudioObject,
  StudioConnection,
} from "./types";
import { objectPresets } from "./objectPresets";
import IconLibrary from "./IconLibrary";
import StudioObjectCard from "./StudioObjectCard";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export default function StudioEngine({ config }: { config: StudioConfig }) {
  const SNAP_SIZE = 28;
  const WORKSPACE_WIDTH = 6000;
  const WORKSPACE_HEIGHT = 4200;

  const snapToGrid = (value: number) => Math.round(value / SNAP_SIZE) * SNAP_SIZE;

  const buildGuidanceCards = () =>
    config.guidanceCards.map((card, index): StudioObject => {
      const type = card.objectType ?? "sticky";
      const preset = objectPresets[type];

      return {
        id: buildId(`guidance-${index}`),
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

  const loadInitialStudioState = () => {
    const defaultGuidanceCards = config.studioId === "problem" ? buildGuidanceCards() : [];
    const fallback = {
      objects: defaultGuidanceCards,
      connections: [] as StudioConnection[],
      zoom: 1,
      checklistState: {} as Record<string, boolean>,
      studentName: "",
      feedbackEmail: "",
      profQuestion: "",
      feedbackStatus: "Not started",
      selectedId: defaultGuidanceCards[0]?.id ?? null,
    };

    if (typeof window === "undefined") {
      return fallback;
    }

    try {
      const raw = localStorage.getItem(config.storageKey);
      if (!raw) return fallback;

      const data = JSON.parse(raw);

      return {
        objects: Array.isArray(data.objects) ? data.objects : fallback.objects,
        connections: Array.isArray(data.connections) ? data.connections : fallback.connections,
        zoom: typeof data.zoom === "number" ? data.zoom : fallback.zoom,
        checklistState: data.checklistState ?? fallback.checklistState,
        studentName: typeof data.studentName === "string" ? data.studentName : fallback.studentName,
        feedbackEmail: typeof data.feedbackEmail === "string" ? data.feedbackEmail : fallback.feedbackEmail,
        profQuestion: typeof data.profQuestion === "string" ? data.profQuestion : fallback.profQuestion,
        feedbackStatus: typeof data.feedbackStatus === "string" ? data.feedbackStatus : fallback.feedbackStatus,
        selectedId: Array.isArray(data.objects) ? data.objects[0]?.id ?? null : fallback.selectedId,
      };
    } catch (error) {
      console.error(error);
      return fallback;
    }
  };

  const initialStudioState = loadInitialStudioState();

  const [objects, setObjects] = useState<StudioObject[]>(initialStudioState.objects);
  const [connections, setConnections] = useState<StudioConnection[]>(initialStudioState.connections);
  const [connectionFromId, setConnectionFromId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(initialStudioState.selectedId);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [zoom, setZoom] = useState(initialStudioState.zoom);
  const [saved, setSaved] = useState("");
  const [studentName, setStudentName] = useState(initialStudioState.studentName);
  const [feedbackEmail, setFeedbackEmail] = useState(initialStudioState.feedbackEmail);
  const [profQuestion, setProfQuestion] = useState(initialStudioState.profQuestion);
  const [feedbackStatus, setFeedbackStatus] = useState(initialStudioState.feedbackStatus);
  const [feedbackError, setFeedbackError] = useState("");
  const [feedbackSuccess, setFeedbackSuccess] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [chartTitle, setChartTitle] = useState("Chart / Graph");
  const [chartType, setChartType] = useState<"bar" | "line" | "pie" | "scatter">("bar");
  const [chartDataText, setChartDataText] = useState("Category,Value\nA,10\nB,20\nC,15");
  const { project, appendAlert } = useProject();
  const [showGuidanceOptions, setShowGuidanceOptions] = useState(false);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>(initialStudioState.checklistState);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(config.toolGroups.map((group) => [group.title, !group.collapsed]))
  );
  const [isPanning, setIsPanning] = useState(false);

  const workspaceRef = useRef<HTMLDivElement | null>(null);
  const panState = useRef({
    active: false,
    startX: 0,
    startY: 0,
    scrollLeft: 0,
    scrollTop: 0,
  });

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
      id: buildId(type),
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
        id: buildId(`guidance-${index}`),
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
    id: buildId("connection"),
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
      id: buildId(object.type),
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


  const saveProgress = () => {
    localStorage.setItem(
      config.storageKey,
      JSON.stringify({
        objects,
        connections,
        zoom,
        checklistState,
        studentName,
        feedbackEmail,
        profQuestion,
        feedbackStatus,
        savedAt: new Date().toISOString(),
      })
    );

    setSaved("Progress saved.");
    setTimeout(() => setSaved(""), 2000);
  };

  const handleStudioAlert = () => {
    const message = `Please review a change or query in ${config.title} for project ${project.setup.projectNumber || project.setup.policyIssue || "this team"}.`;
    const note = window.prompt("Add an optional note for the admin (leave blank to skip):", "");
    appendAlert(config.studioId, config.title, message, note ?? undefined);
    setSaved("Admin alert sent.");
    setTimeout(() => setSaved(""), 2200);
  };

  const submitProfessorFeedback = async () => {
    setFeedbackError("");
    setFeedbackSuccess("");

    if (!project.setup.groupNumber.trim() || !project.setup.courseName.trim() || !project.setup.policyIssue.trim() || !project.setup.professorName.trim() || !project.setup.professorEmail.trim()) {
      setFeedbackError(
        "Complete your team setup information before requesting professor feedback."
      );
      return;
    }

    if (!studentName.trim()) {
      setFeedbackError("Enter your student or group name before submitting.");
      return;
    }

    if (!feedbackEmail.trim() || !emailPattern.test(feedbackEmail.trim())) {
      setFeedbackError("Enter a valid student email before submitting.");
      return;
    }

    if (!profQuestion.trim()) {
      setFeedbackError("Write a question for your professor before submitting.");
      return;
    }

    setIsSubmittingFeedback(true);

    try {
      const response = await fetch("/api/professor-feedback/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectKey: project.setup.projectId,
          studioId: config.studioId,
          studioName: config.title,
          groupNumber: project.setup.groupNumber.trim(),
          courseName: project.setup.courseName.trim(),
          policyIssue: project.setup.policyIssue.trim(),
          submittedByName: studentName.trim(),
          submittedByEmail: feedbackEmail.trim(),
          professorName: project.setup.professorName.trim(),
          professorEmail: project.setup.professorEmail.trim(),
          question: profQuestion.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Unable to submit feedback.");
      }

      setFeedbackSuccess("Feedback request submitted successfully.");
    } catch (error) {
      setFeedbackError(
        error instanceof Error
          ? error.message
          : "Unable to submit professor feedback."
      );
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const resetCanvas = () => {
    localStorage.removeItem(config.storageKey);
    setObjects([]);
    setConnections([]);
    setSelectedId(null);
    setZoom(1);
    setTimeout(createGuidanceCards, 0);
  };


  const readFileAsDataUrl = (file: File, callback: (dataUrl: string) => void) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") callback(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleVisualUpload = (file: File, title = "Uploaded Visual") => {
    readFileAsDataUrl(file, (dataUrl) => {
      addObject("evidence" as ObjectType, {
        title: file.name || title,
        content: "Uploaded visual. Add caption and source in the notes.",
        width: 460,
        height: 300,
        color: "#f8fafc",
        icon: "🖼️",
        imageDataUrl: dataUrl,
        visualType: "image",
      } as Partial<StudioObject>);
    });
  };

  const uploadToSelectedObject = (file: File) => {
    if (!selectedObject) return;

    readFileAsDataUrl(file, (dataUrl) => {
      updateObject(selectedObject.id, {
        imageDataUrl: dataUrl,
        visualType: "image",
        content: selectedObject.content || "Uploaded visual.",
      } as Partial<StudioObject>);
    });
  };

  const pasteClipboardToSelectedObject = async () => {
    if (!selectedObject || typeof navigator === "undefined") return;

    try {
      const clipboardItems = await navigator.clipboard.read();

      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => type.startsWith("image/"));

        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], "pasted-visual.png", { type: imageType });
          uploadToSelectedObject(file);
          return;
        }
      }
    } catch {
      // Some browsers block image clipboard access; fall back to text.
    }

    try {
      const text = await navigator.clipboard.readText();

      if (text) {
        updateObject(selectedObject.id, {
          content: selectedObject.content
            ? `${selectedObject.content}\n\n${text}`
            : text,
          icon:
            text.length <= 4 && /\p{Extended_Pictographic}/u.test(text)
              ? text
              : selectedObject.icon,
        } as Partial<StudioObject>);
      }
    } catch {
      return;
    }
  };

  const copySelectedObjectContent = async () => {
    if (!selectedObject || typeof navigator === "undefined") return;

    const valueToCopy =
      selectedObject.icon ||
      selectedObject.content ||
      selectedObject.title ||
      "";

    if (!valueToCopy) return;

    try {
      await navigator.clipboard.writeText(valueToCopy);
      setSaved("Copied.");
      setTimeout(() => setSaved(""), 1200);
    } catch {
      return;
    }
  };

  const removeVisualFromSelectedObject = () => {
    if (!selectedObject) return;

    updateObject(selectedObject.id, {
      imageDataUrl: undefined,
      chartData: undefined,
      visualType: undefined,
      chartType: undefined,
      icon: undefined,
    } as Partial<StudioObject>);
  };

  const parseNumberValue = (value: string) => {
    const cleaned = value.trim().toLowerCase().replace(/,/g, "");
    const number = Number(cleaned.replace(/k|m|%/g, ""));

    if (Number.isNaN(number)) return 0;
    if (cleaned.includes("m")) return number * 1000000;
    if (cleaned.includes("k")) return number * 1000;
    return number;
  };

  const parseChartRows = () => {
    const lines = chartDataText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    const csvRows = lines
      .filter((line) => line.includes(","))
      .slice(lines[0]?.toLowerCase().includes("category") ? 1 : 0)
      .map((line) => {
        const [label, value] = line.split(",").map((item) => item.trim());

        return {
          label: label || "Item",
          value: parseNumberValue(value || "0"),
        };
      })
      .filter((row) => row.label);

    if (csvRows.length > 0) return csvRows;

    const text = chartDataText.toLowerCase();
    const rangeMatch = text.match(/from\s+([0-9.,]+[km]?)\s+to\s+([0-9.,]+[km]?).*?(?:over|in|during)\s+([0-9]+)\s+years?(?:.*?\(?([12][0-9]{3})\s*(?:to|-)\s*([12][0-9]{3})\)?)?/i);

    if (rangeMatch) {
      const startValue = parseNumberValue(rangeMatch[1]);
      const endValue = parseNumberValue(rangeMatch[2]);
      const numberOfYears = Math.max(2, Number(rangeMatch[3]) || 10);
      const startYear = rangeMatch[4] ? Number(rangeMatch[4]) : 1;

      return Array.from({ length: numberOfYears }, (_, index) => {
        const progress = index / Math.max(numberOfYears - 1, 1);
        const value = Math.round(startValue + (endValue - startValue) * progress);

        return {
          label: rangeMatch[4] ? String(startYear + index) : `Year ${index + 1}`,
          value,
        };
      });
    }

    const yearValueMatches = Array.from(
      chartDataText.matchAll(/([12][0-9]{3})\s*[=:,-]\s*([0-9.,]+[km%]?)/gi)
    );

    if (yearValueMatches.length > 0) {
      return yearValueMatches.map((match) => ({
        label: match[1],
        value: parseNumberValue(match[2]),
      }));
    }

    const numbers = Array.from(chartDataText.matchAll(/([0-9.,]+[km%]?)/gi)).map(
      (match) => parseNumberValue(match[1])
    );

    if (numbers.length > 0) {
      return numbers.map((value, index) => ({
        label: `Item ${index + 1}`,
        value,
      }));
    }

    return [];
  };

  const buildManualChart = () => {
    const rows = parseChartRows();

    if (rows.length === 0) {
      setSaved("Add chart data first.");
      setTimeout(() => setSaved(""), 1400);
      return;
    }

    addObject("chart" as ObjectType, {
      title: chartTitle || "Manual Chart / Graph",
      content: "Editable chart built from student-entered data. Add caption and source in the inspector.",
      width: 520,
      height: 340,
      color: "#f8fafc",
      icon: "📊",
      visualType: "chart",
      chartType,
      chartData: rows,
    } as Partial<StudioObject>);
  };

  const addSelectedGuidanceCard = (card: (typeof config.guidanceCards)[number]) => {
    const type = card.objectType ?? "sticky";
    const preset = objectPresets[type];

    addObject(type, {
      title: card.title,
      content: card.prompt,
      width: type === "sticky" ? 340 : preset.width,
      height: type === "sticky" ? 180 : preset.height,
      color: "#fef3c7",
      icon: "💡",
    });
  };

  const copyIconToClipboard = async (icon: string) => {
    if (typeof navigator === "undefined") return;

    try {
      await navigator.clipboard.writeText(icon);
      setSaved("Icon copied. Select a card and use Paste to Card.");
      setTimeout(() => setSaved(""), 1800);
    } catch {
      return;
    }
  };

  const completedChecklist = config.checklist.filter((item) => checklistState[item]).length;
const selectedObjectConnections = selectedObject
  ? connections.filter(
      (connection) =>
        connection.fromId === selectedObject.id ||
        connection.toId === selectedObject.id
    )
  : [];
  const toolsContent = (
    <>
      <div className="panelHeader">
        <h3>Tools</h3>
        <p className="fieldNote">Add objects, visuals, icons, and arrange the workspace.</p>
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
                  {group.tools.filter((tool) => tool.type !== "aiVisual" && !tool.label.toLowerCase().includes("ai visual")).map((tool) => (
                    <button
                      key={`${group.title}-${tool.type}-${tool.label}`}
                      type="button"
                      className="button secondaryButton"
                      onClick={() => addObject(tool.type)}
                      style={{
                        justifyContent: "flex-start",
                        padding: "8px 10px",
                        width: "100%",
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
            onClick={() => setShowGuidanceOptions((prev) => !prev)}
            style={{ width: "100%" }}
          >
            + Guidance Cards
          </button>

          {showGuidanceOptions ? (
            <div style={{ display: "grid", gap: 7, marginTop: 8 }}>
              {config.guidanceCards.map((card) => (
                <button
                  key={card.title}
                  type="button"
                  className="button secondaryButton"
                  onClick={() => addSelectedGuidanceCard(card)}
                  style={{ justifyContent: "flex-start", width: "100%" }}
                >
                  {card.title}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="panelHint" style={{ padding: 10 }}>
          <strong>Visual Builder</strong>
          <p className="fieldNote">
            Upload visuals, build simple charts, or copy icons into cards.
          </p>

          <label className="button secondaryButton" style={{ cursor: "pointer", justifyContent: "center" }}>
            + Upload Image / Screenshot
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleVisualUpload(file, "Uploaded Image / Screenshot");
                event.currentTarget.value = "";
              }}
            />
          </label>

          <label className="button secondaryButton" style={{ cursor: "pointer", justifyContent: "center" }}>
            + Upload Chart / Graph
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleVisualUpload(file, "Uploaded Chart / Graph");
                event.currentTarget.value = "";
              }}
            />
          </label>

          <button
            type="button"
            className="button secondaryButton"
            onClick={() =>
              addObject("evidence" as ObjectType, {
                title: "Evidence Figure",
                content:
                  "Paste or upload a figure/screenshot from your evidence source. Add caption and source in the inspector.",
                width: 420,
                height: 260,
                color: "#dbeafe",
                icon: "📎",
                visualType: "image",
              } as Partial<StudioObject>)
            }
          >
            + Evidence Figure Card
          </button>

          <div className="panelHint" style={{ padding: 8, marginTop: 8 }}>
            <strong>Chart / Graph Builder</strong>

            <label className="fieldLabel">
              <span>Title</span>
              <input
                value={chartTitle}
                onChange={(event) => setChartTitle(event.target.value)}
              />
            </label>

            <label className="fieldLabel">
              <span>Chart type</span>
              <select
                value={chartType}
                onChange={(event) =>
                  setChartType(event.target.value as "bar" | "line" | "pie" | "scatter")
                }
              >
                <option value="bar">Bar</option>
                <option value="line">Line</option>
                <option value="pie">Pie</option>
                <option value="scatter">Scatter</option>
              </select>
            </label>

            <label className="fieldLabel">
              <span>Data or trend description</span>
              <textarea
                rows={5}
                value={chartDataText}
                onChange={(event) => setChartDataText(event.target.value)}
                placeholder={"Category,Value\nA,10\nB,20\n\nor: from 10K to 100K over 10 years (2000 to 2009)"}
              />
            </label>

            <button
              type="button"
              className="button"
              onClick={buildManualChart}
              style={{ width: "100%" }}
            >
              Build Chart
            </button>
          </div>
        </div>

        <div className="panelHint" style={{ padding: 10 }}>
          <strong>Icon Library</strong>
          <p className="fieldNote">Choose an icon to copy, then paste it into any selected card.</p>
          <IconLibrary onAddIcon={copyIconToClipboard} />
        </div>
      </div>
    </>
  );

  const workspaceContent = (
    <section
      className="panelCard"
      style={{
        padding: 0,
        overflow: "hidden",
        height: "100%",
        minHeight: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        className="panelHeader"
        style={{
          padding: 12,
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
          cursor: isPanning ? "grabbing" : "default",
        }}
        onWheel={(event) => {
          if (!event.ctrlKey) return;
          event.preventDefault();

          setZoom((prev: number) => {
            const direction = event.deltaY > 0 ? -0.08 : 0.08;
            const next = Math.min(2.2, Math.max(0.45, prev + direction));
            return Math.round(next * 100) / 100;
          });
        }}
        onPointerDown={(event) => {
          const target = event.target as HTMLElement;
          const isCanvasBackground =
            target.dataset.workspaceBackground === "true" ||
            target.dataset.workspaceInner === "true";

          if (!isCanvasBackground && !event.nativeEvent.getModifierState("Space")) return;

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

          setIsPanning(true);
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
          setIsPanning(false);

          const workspace = workspaceRef.current;
          workspace?.releasePointerCapture(event.pointerId);
        }}
        onClick={() => {
          setSelectedId(null);
          setSelectedIds([]);
        }}
        data-workspace-background="true"
      >
        <div
          data-workspace-inner="true"
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
            setZoom((prev: number) => Math.max(0.5, Math.round((prev - 0.1) * 10) / 10))
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
            setZoom((prev: number) => Math.min(2, Math.round((prev + 0.1) * 10) / 10))
          }
        >
          +
        </button>

        <button type="button" className="button secondaryButton" onClick={resetCanvas}>
          Reset
        </button>

        <button type="button" className="button" onClick={saveProgress}>
          Save Progress
        </button>
      </div>
    </section>
  );

  const reviewContent = (
    <>
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
              <option>Reviewed</option>
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
            <span>Reflection Note</span>
            <textarea
              rows={4}
              value={selectedObject.aiHint ?? ""}
              onChange={(event) =>
                updateObject(selectedObject.id, { aiHint: event.target.value })
              }
            />
          </label>

          <div className="panelHint" style={{ display: "grid", gap: 8 }}>
            <strong>Visual Options</strong>

            <label className="button secondaryButton" style={{ cursor: "pointer", justifyContent: "center" }}>
              Upload / Replace Visual
              <input
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) uploadToSelectedObject(file);
                  event.currentTarget.value = "";
                }}
              />
            </label>

            <button
              type="button"
              className="button secondaryButton"
              onClick={pasteClipboardToSelectedObject}
            >
              Paste to Card
            </button>

            <button
              type="button"
              className="button secondaryButton"
              onClick={copySelectedObjectContent}
            >
              Copy from Card
            </button>

            <button
              type="button"
              className="button secondaryButton"
              onClick={removeVisualFromSelectedObject}
            >
              Remove Visual
            </button>
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
                  status: "Ready",
                })
              }
            >
              Mark Reviewed
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
      ) : null}

      <Panel title="Studio Guidance">
        <p className="fieldNote">Rule-based prompts for this studio.</p>

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
        <div className="panelHint">
          <p className="fieldNote" style={{ marginBottom: 0 }}>
            Professor name and email are pulled from team setup.
          </p>
          <strong>{project.setup.professorName || "Professor name not set"}</strong>
          <p className="fieldNote" style={{ marginBottom: 0 }}>
            {project.setup.professorEmail || "Professor email not set"}
          </p>
        </div>

        <input
          value={studentName}
          onChange={(event) => setStudentName(event.target.value)}
          placeholder="Your name or group"
        />

        <input
          value={feedbackEmail}
          onChange={(event) => setFeedbackEmail(event.target.value)}
          placeholder="Your email"
          type="email"
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

        <button
          type="button"
          className="button secondaryButton"
          onClick={submitProfessorFeedback}
          disabled={isSubmittingFeedback}
        >
          {isSubmittingFeedback ? "Submitting..." : "Send feedback request"}
        </button>

        {feedbackError ? (
          <p style={{ color: "#b91c1c", margin: 0 }}>{feedbackError}</p>
        ) : null}

        {feedbackSuccess ? (
          <p style={{ color: "#15803d", margin: 0 }}>{feedbackSuccess}</p>
        ) : null}
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
        <StudioResources
          studio={
            config.studioId === "problem"
              ? "Problem Studio"
              : config.studioId === "process"
              ? "Process Studio"
              : config.studioId === "solution"
              ? "Solution Studio"
              : "Implementation Studio"
          }
        />
      </Panel>
    </>
  );

  return (
    <StudioShell
      title={config.title}
      previousHref={config.previousHref}
      nextHref={config.nextHref}
      dashboardHref={config.dashboardHref}
      onSave={saveProgress}
      savedMessage={saved}
      onAlert={handleStudioAlert}
      alertLabel="Alert Admin"
      tools={toolsContent}
      workspace={workspaceContent}
      review={reviewContent}
    />
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
