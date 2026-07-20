"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { ReactNode } from "react";
import type { StudioObject } from "./types";

type ExtendedStudioObject = StudioObject & {
  imageDataUrl?: string;
  visualType?: "image" | "chart" | "icon";
  chartType?: "bar" | "line" | "pie" | "scatter";
  chartData?: Array<{ label: string; value: number }>;
  visualInsertIndex?: number;
  embeddedVisuals?: EmbeddedVisual[];
};

type EmbeddedVisual = {
  id: string;
  insertIndex: number;
  imageDataUrl?: string;
  visualType: "image" | "chart";
  chartType?: "bar" | "line" | "pie" | "scatter";
  chartData?: Array<{ label: string; value: number }>;
  icon?: string;
};

const VISUAL_CLIPBOARD_KEY = "plstudio_visual_clipboard";

export default function StudioObjectCard({
  object,
  selected,
  connectionStart,
  zoom,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
  snapToGrid,
  onContentCursorChange,
}: {
  snapToGrid: (value: number) => number;
  object: StudioObject;
  selected: boolean;
  connectionStart: boolean;
  zoom: number;
  onSelect: (id: string, multiSelect: boolean) => void;
  onUpdate: (id: string, changes: Partial<StudioObject>) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onContentCursorChange: (id: string, start: number, end: number) => void;
}) {
  const visualObject = object as ExtendedStudioObject;
  const contentCursor = useRef({ start: object.content.length, end: object.content.length });
  const actionStatusTimer = useRef<number | null>(null);
  const [actionStatus, setActionStatus] = useState("");
  const embeddedImageHeight = Math.max(140, Math.min(520, Math.round(object.height * 0.58)));
  const embeddedChartHeight = Math.max(120, Math.min(360, Math.round(object.height * 0.44)));

  const notifyAction = (message: string) => {
    setActionStatus(message);

    if (actionStatusTimer.current) {
      window.clearTimeout(actionStatusTimer.current);
    }

    actionStatusTimer.current = window.setTimeout(() => {
      setActionStatus("");
      actionStatusTimer.current = null;
    }, 1400);
  };

  useEffect(() => {
    return () => {
      if (actionStatusTimer.current) {
        window.clearTimeout(actionStatusTimer.current);
      }
    };
  }, []);

  const recordCursor = (element: HTMLTextAreaElement) => {
    contentCursor.current = {
      start: element.selectionStart,
      end: element.selectionEnd,
    };
    onContentCursorChange(object.id, element.selectionStart, element.selectionEnd);
  };

  const insertTextAtCursor = (text: string) => {
    const start = Math.min(contentCursor.current.start, object.content.length);
    const end = Math.min(contentCursor.current.end, object.content.length);
    const nextContent = `${object.content.slice(0, start)}${text}${object.content.slice(end)}`;
    const nextCursor = start + text.length;

    contentCursor.current = {
      start: nextCursor,
      end: nextCursor,
    };
    onContentCursorChange(object.id, nextCursor, nextCursor);
    onUpdate(object.id, { content: nextContent });
  };

  const buildClipboardText = (payload: Partial<ExtendedStudioObject>) => {
    if (payload.visualType === "chart" || payload.chartData?.length) {
      const rows = payload.chartData?.length
        ? payload.chartData
            .map((row) => `${row.label}: ${row.value}`)
            .join("\n")
        : "";
      const title = payload.title || "Chart / Graph";
      const content = payload.content || "";

      return [title, content, rows].filter(Boolean).join("\n");
    }

    return payload.icon || payload.content || payload.title || "";
  };

  const isChartPayload = (payload: Partial<ExtendedStudioObject>) =>
    payload.visualType === "chart" || Boolean(payload.chartData?.length);

  const getEmbeddedVisuals = () => {
    const visuals = Array.isArray(visualObject.embeddedVisuals)
      ? [...visualObject.embeddedVisuals]
      : [];

    const hasLegacyVisual =
      object.type !== "chart" &&
      object.type !== "icon" &&
      visuals.length === 0 &&
      typeof visualObject.visualInsertIndex === "number" &&
      Boolean(
        visualObject.imageDataUrl ||
          visualObject.visualType === "chart" ||
          visualObject.chartData?.length
      );

    if (hasLegacyVisual) {
      visuals.push({
        id: "legacy-visual",
        insertIndex:
          typeof visualObject.visualInsertIndex === "number"
            ? visualObject.visualInsertIndex
            : object.content.length,
        imageDataUrl: visualObject.imageDataUrl,
        visualType: visualObject.imageDataUrl ? "image" : "chart",
        chartType: visualObject.chartType,
        chartData: visualObject.chartData,
        icon: object.icon,
      });
    }

    return visuals
      .map((visual) => ({
        ...visual,
        insertIndex: Math.min(Math.max(visual.insertIndex, 0), object.content.length),
      }))
      .sort((left, right) => left.insertIndex - right.insertIndex);
  };

  const addEmbeddedVisual = (visual: Omit<EmbeddedVisual, "id">) => {
    const embeddedVisuals = [
      ...getEmbeddedVisuals().filter((item) => item.id !== "legacy-visual"),
      {
        ...visual,
        id: crypto.randomUUID(),
      },
    ];

    onUpdate(object.id, {
      embeddedVisuals,
      imageDataUrl: undefined,
      visualType: undefined,
      chartType: undefined,
      chartData: undefined,
      visualInsertIndex: undefined,
    } as Partial<StudioObject>);
  };

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    if (object.locked) return;

    const startX = event.clientX;
    const startY = event.clientY;
    const originalX = object.x;
    const originalY = object.y;

    const onMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;

      onUpdate(object.id, {
        x: Math.max(0, snapToGrid(originalX + dx)),
        y: Math.max(0, snapToGrid(originalY + dy)),
      });
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const startResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    if (object.locked) return;

    const startX = event.clientX;
    const startY = event.clientY;
    const originalWidth = object.width;
    const originalHeight = object.height;

    const onMove = (moveEvent: PointerEvent) => {
      const dx = (moveEvent.clientX - startX) / zoom;
      const dy = (moveEvent.clientY - startY) / zoom;

      onUpdate(object.id, {
        width: Math.max(120, snapToGrid(originalWidth + dx)),
        height: Math.max(90, snapToGrid(originalHeight + dy)),
      });
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const uploadToCard = (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        onUpdate(object.id, {
          imageDataUrl: reader.result,
          visualType: "image",
          content: object.content || "Uploaded visual.",
        } as Partial<StudioObject>);
        notifyAction("Image uploaded");
      }
    };

    reader.readAsDataURL(file);
  };

  const copyCard = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    const visualPayload = {
      imageDataUrl: visualObject.imageDataUrl,
      visualType: visualObject.visualType,
      chartType: visualObject.chartType,
      chartData: visualObject.chartData,
      icon: object.icon,
      content: object.content,
      title: object.title,
    };

    localStorage.setItem(VISUAL_CLIPBOARD_KEY, JSON.stringify(visualPayload));

    try {
      await navigator.clipboard.writeText(object.icon || object.content || object.title || "");
      notifyAction("Copied");
    } catch {
      notifyAction("Copied locally");
    }
  };

  const pasteToCard = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    const localVisual = localStorage.getItem(VISUAL_CLIPBOARD_KEY);

    if (localVisual) {
      try {
        const parsed = JSON.parse(localVisual);
        const visualInsertIndex = Math.min(
          contentCursor.current.start,
          object.content.length
        );

        if (isChartPayload(parsed)) {
          addEmbeddedVisual({
            insertIndex: visualInsertIndex,
            visualType: "chart",
            chartType: parsed.chartType || "bar",
            chartData: parsed.chartData,
            icon: parsed.icon || object.icon,
          });
          notifyAction("Chart pasted");
          return;
        }

        if (parsed.imageDataUrl) {
          addEmbeddedVisual({
            insertIndex: visualInsertIndex,
            imageDataUrl: parsed.imageDataUrl,
            visualType: "image",
            icon: parsed.icon || object.icon,
          });
          notifyAction("Image pasted");
          return;
        }

        const text = buildClipboardText(parsed);
        if (text) {
          insertTextAtCursor(text);
          notifyAction("Pasted");
        }

        return;
      } catch {
        // Continue to browser clipboard fallback.
      }
    }

    try {
      const clipboardItems = await navigator.clipboard.read();

      for (const item of clipboardItems) {
        const imageType = item.types.find((type) => type.startsWith("image/"));

        if (imageType) {
          const blob = await item.getType(imageType);
          const reader = new FileReader();

          reader.onload = () => {
            if (typeof reader.result === "string") {
              onUpdate(object.id, {
                imageDataUrl: reader.result,
                visualType: "image",
              } as Partial<StudioObject>);
              notifyAction("Image pasted");
            }
          };

          reader.readAsDataURL(blob);
          return;
        }
      }
    } catch {
      // Continue to text fallback.
    }

    try {
      const text = await navigator.clipboard.readText();

      if (text) {
        insertTextAtCursor(text);
        if (text.length <= 4 && /\p{Extended_Pictographic}/u.test(text)) {
          onUpdate(object.id, {
            icon: text,
          } as Partial<StudioObject>);
        }
        notifyAction("Pasted");
      }
    } catch {
      notifyAction("Paste unavailable");
      return;
    }
  };

  const removeVisual = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    onUpdate(object.id, {
      imageDataUrl: undefined,
      chartData: undefined,
      chartType: undefined,
      visualType: undefined,
      embeddedVisuals: undefined,
      visualInsertIndex: undefined,
      icon: undefined,
    } as Partial<StudioObject>);
    notifyAction("Visual removed");
  };

  const renderChart = (
    chartData = visualObject.chartData || [],
    chartType = visualObject.chartType
  ) => {
    const data = chartData;
    const maxValue = Math.max(...data.map((row) => row.value), 1);

    if (!data.length) {
      return (
        <textarea
          value={object.content}
          onPointerDown={(event) => event.stopPropagation()}
          onFocus={(event) => recordCursor(event.currentTarget)}
          onClick={(event) => recordCursor(event.currentTarget)}
          onKeyUp={(event) => recordCursor(event.currentTarget)}
          onSelect={(event) => recordCursor(event.currentTarget)}
          onChange={(event) => onUpdate(object.id, { content: event.target.value })}
          readOnly={object.locked}
          style={textareaStyle}
          placeholder="Paste chart notes/data here or use U to upload a chart image."
        />
      );
    }

    if (chartType === "line" || chartType === "scatter") {
      const points = data
        .map((row, index) => {
          const x = 36 + (index / Math.max(data.length - 1, 1)) * 348;
          const y = 150 - (row.value / maxValue) * 118;
          return `${x},${y}`;
        })
        .join(" ");

      return (
        <svg width="100%" height="100%" viewBox="0 0 420 180">
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
      <div style={{ display: "grid", gap: 8, alignContent: "center", width: "100%" }}>
        {data.map((row) => (
          <div key={row.label}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 12 }}>
              <span>{row.label}</span>
              <strong>{row.value.toLocaleString()}</strong>
            </div>
            <div style={barTrackStyle}>
              <div style={{ ...barFillStyle, width: `${(row.value / maxValue) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderBody = () => {
    const renderTextEditor = () => (
      <textarea
        value={object.content}
        onPointerDown={(event) => event.stopPropagation()}
        onFocus={(event) => recordCursor(event.currentTarget)}
        onClick={(event) => recordCursor(event.currentTarget)}
        onKeyUp={(event) => recordCursor(event.currentTarget)}
        onSelect={(event) => recordCursor(event.currentTarget)}
        onChange={(event) => onUpdate(object.id, { content: event.target.value })}
        readOnly={object.locked}
        style={textareaStyle}
      />
    );

    const renderTextSegment = (
      value: string,
      offset: number,
      onChange: (value: string) => void
    ) => (
      <textarea
        value={value}
        onPointerDown={(event) => event.stopPropagation()}
        onFocus={(event) => {
          const start = offset + event.currentTarget.selectionStart;
          const end = offset + event.currentTarget.selectionEnd;
          contentCursor.current = { start, end };
          onContentCursorChange(object.id, start, end);
        }}
        onClick={(event) => {
          const start = offset + event.currentTarget.selectionStart;
          const end = offset + event.currentTarget.selectionEnd;
          contentCursor.current = { start, end };
          onContentCursorChange(object.id, start, end);
        }}
        onKeyUp={(event) => {
          const start = offset + event.currentTarget.selectionStart;
          const end = offset + event.currentTarget.selectionEnd;
          contentCursor.current = { start, end };
          onContentCursorChange(object.id, start, end);
        }}
        onSelect={(event) => {
          const start = offset + event.currentTarget.selectionStart;
          const end = offset + event.currentTarget.selectionEnd;
          contentCursor.current = { start, end };
          onContentCursorChange(object.id, start, end);
        }}
        onChange={(event) => onChange(event.target.value)}
        readOnly={object.locked}
        style={textareaStyle}
      />
    );

    const embeddedVisuals = getEmbeddedVisuals();
    const shouldShowTextWithVisual =
      object.type !== "chart" &&
      object.type !== "icon" &&
      embeddedVisuals.length > 0;

    if (shouldShowTextWithVisual) {
      const updateTextSegment = (start: number, end: number, value: string) => {
        const nextContent = `${object.content.slice(0, start)}${value}${object.content.slice(end)}`;
        const delta = value.length - (end - start);
        const nextEmbeddedVisuals = embeddedVisuals.map((visual) => ({
          ...visual,
          insertIndex:
            visual.insertIndex >= end
              ? Math.max(0, visual.insertIndex + delta)
              : visual.insertIndex,
        }));

        onUpdate(object.id, {
          content: nextContent,
          embeddedVisuals: nextEmbeddedVisuals,
          imageDataUrl: undefined,
          visualType: undefined,
          chartType: undefined,
          chartData: undefined,
          visualInsertIndex: undefined,
        } as Partial<StudioObject>);
      };

      let textCursor = 0;
      const visualRows: ReactNode[] = [];

      embeddedVisuals.forEach((visual, index) => {
        const segmentStart = textCursor;
        const segmentEnd = visual.insertIndex;
        const segment = object.content.slice(segmentStart, segmentEnd);

        visualRows.push(
          <div key={`text-${visual.id}-${index}`} style={textSegmentFrameStyle}>
            {renderTextSegment(segment, segmentStart, (value) =>
              updateTextSegment(segmentStart, segmentEnd, value)
            )}
          </div>
        );

        visualRows.push(
          <div
            key={visual.id}
            style={{
              ...compactVisualBodyStyle,
              height: visual.imageDataUrl ? embeddedImageHeight : embeddedChartHeight,
            }}
          >
            {visual.imageDataUrl ? (
              <img
                src={visual.imageDataUrl}
                alt={object.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                  objectPosition: "center",
                  borderRadius: 10,
                  display: "block",
                }}
              />
            ) : (
              renderChart(visual.chartData || [], visual.chartType)
            )}
          </div>
        );

        textCursor = visual.insertIndex;
      });

      const finalSegmentStart = textCursor;
      const finalSegment = object.content.slice(finalSegmentStart);
      visualRows.push(
        <div key="text-final" style={textSegmentFrameStyle}>
          {renderTextSegment(finalSegment, finalSegmentStart, (value) =>
            updateTextSegment(finalSegmentStart, object.content.length, value)
          )}
        </div>
      );

      return (
        <div style={inlineVisualBodyStyle}>
          {visualRows}
        </div>
      );
    }

    if (visualObject.imageDataUrl) {
      return (
        <div style={visualBodyStyle}>
          <img
            src={visualObject.imageDataUrl}
            alt={object.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              borderRadius: 12,
            }}
          />
        </div>
      );
    }

    if (visualObject.visualType === "chart" || object.type === "chart") {
      return <div style={visualBodyStyle}>{renderChart()}</div>;
    }

    if (visualObject.visualType === "icon" || object.type === "icon") {
      return (
        <div style={iconBodyStyle}>
          <div style={{ fontSize: Math.min(object.width, object.height) * 0.34 }}>
            {object.icon || object.content}
          </div>
        </div>
      );
    }

    return renderTextEditor();
  };

  return (
    <div
      onPointerDown={startDrag}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(object.id, event.shiftKey);
      }}
      style={{
        position: "absolute",
        left: object.x,
        top: object.y,
        width: object.width,
        height: object.height,
        background: object.color,
        borderRadius: 10,
        padding: 14,
        boxShadow: selected
          ? "0 0 0 3px rgba(212,165,116,0.36), 0 14px 30px rgba(43,88,118,0.16)"
          : "0 10px 22px rgba(43,88,118,0.12)",
        border: connectionStart
          ? "3px solid #16a34a"
          : selected
          ? "3px solid #1e3a5f"
          : "1px solid rgba(43,88,118,.14)",
        cursor: object.locked ? "default" : "grab",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        gap: 8,
        overflow: "hidden",
        zIndex: selected ? 20 : 10,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
          alignItems: "center",
        }}
      >
        <strong style={{ color: "#1e3a5f" }}>
          {object.icon ? `${object.icon} ` : null}
          {object.title}
        </strong>

        <div style={{ display: "flex", gap: 4 }}>
          <label
            style={miniButtonStyle}
            title="Upload visual"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
          >
            U
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
              hidden
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) uploadToCard(file);
                event.currentTarget.value = "";
              }}
            />
          </label>

          <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={copyCard} style={miniButtonStyle} title="Copy">
            C
          </button>

          <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={pasteToCard} style={miniButtonStyle} title="Paste">
            P
          </button>

          {(visualObject.imageDataUrl ||
            visualObject.visualType ||
            visualObject.embeddedVisuals?.length ||
            object.icon) ? (
            <button type="button" onPointerDown={(e) => e.stopPropagation()} onClick={removeVisual} style={miniButtonStyle} title="Remove visual">
              R
            </button>
          ) : null}

          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onDuplicate(object.id);
              notifyAction("Duplicated");
            }}
            style={miniButtonStyle}
            title="Duplicate"
          >
            ⧉
          </button>

          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              onDelete(object.id);
              notifyAction("Deleted");
            }}
            style={miniButtonStyle}
            title="Delete card"
          >
            ×
          </button>
        </div>

        {actionStatus ? (
          <span style={actionStatusStyle} role="status" aria-live="polite">
            {actionStatus}
          </span>
        ) : null}
      </div>

      {renderBody()}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <select
          value={object.status ?? "Draft"}
          onPointerDown={(event) => event.stopPropagation()}
          onChange={(event) =>
            onUpdate(object.id, {
              status: event.target.value as StudioObject["status"],
            })
          }
          style={smallSelectStyle}
          disabled={object.locked}
        >
          <option>Draft</option>
          <option>Reviewed</option>
          <option>Professor Reviewed</option>
          <option>Ready</option>
        </select>

        <select
          value={object.color}
          onPointerDown={(event) => event.stopPropagation()}
          onChange={(event) => onUpdate(object.id, { color: event.target.value })}
          style={smallSelectStyle}
          disabled={object.locked}
        >
          <option value="#ffd6d6">Red</option>
          <option value="#dbeafe">Blue</option>
          <option value="#fef3c7">Yellow</option>
          <option value="#e9d5ff">Purple</option>
          <option value="#dcfce7">Green</option>
          <option value="#ccfbf1">Teal</option>
          <option value="#f8fafc">White</option>
        </select>

        <button
          type="button"
          onPointerDown={startResize}
          style={{
            border: "none",
            background: "rgba(212,165,116,0.22)",
            color: "#1e3a5f",
            borderRadius: 8,
            width: 26,
            height: 26,
            cursor: object.locked ? "not-allowed" : "nwse-resize",
            fontWeight: 900,
          }}
          title="Resize"
          disabled={object.locked}
        >
          ↘
        </button>
      </div>
    </div>
  );
}

const miniButtonStyle: CSSProperties = {
  border: "none",
  background: "rgba(255,248,231,0.85)",
  color: "#1e3a5f",
  borderRadius: 8,
  width: 24,
  height: 24,
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 11,
  display: "grid",
  placeItems: "center",
};

const actionStatusStyle: CSSProperties = {
  position: "absolute",
  top: 44,
  right: 12,
  zIndex: 4,
  maxWidth: 160,
  padding: "5px 8px",
  borderRadius: 999,
  background: "rgba(20, 33, 61, 0.92)",
  color: "#ffffff",
  fontSize: 11,
  fontWeight: 800,
  lineHeight: 1,
  boxShadow: "0 8px 18px rgba(3, 7, 18, 0.2)",
  pointerEvents: "none",
};

const smallSelectStyle: CSSProperties = {
  border: "1px solid rgba(43,88,118,0.16)",
  borderRadius: 999,
  padding: "4px 8px",
  background: "white",
  color: "#1e3a5f",
  fontWeight: 700,
  maxWidth: 115,
};

const textareaStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  resize: "none",
  border: "none",
  outline: "none",
  background: "transparent",
  color: "#2c3e50",
  font: "inherit",
  lineHeight: 1.45,
  cursor: "text",
};

const visualBodyStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  minHeight: 0,
  minWidth: 0,
  borderRadius: 14,
  background: "rgba(255,255,255,0.55)",
  display: "grid",
  placeItems: "center",
  overflow: "hidden",
  padding: 10,
};

const inlineVisualBodyStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  minHeight: 0,
  display: "grid",
  gridAutoRows: "minmax(34px, auto)",
  gap: 8,
  overflowY: "auto",
};

const textSegmentFrameStyle: CSSProperties = {
  minHeight: 34,
  display: "grid",
};

const compactVisualBodyStyle: CSSProperties = {
  ...visualBodyStyle,
  minHeight: 110,
  padding: 8,
};

const iconBodyStyle: CSSProperties = {
  ...visualBodyStyle,
  fontSize: 54,
};

const barTrackStyle: CSSProperties = {
  width: "100%",
  height: 12,
  borderRadius: 999,
  background: "rgba(212,165,116,0.22)",
  overflow: "hidden",
};

const barFillStyle: CSSProperties = {
  height: "100%",
  borderRadius: 999,
  background: "#1e3a5f",
};
