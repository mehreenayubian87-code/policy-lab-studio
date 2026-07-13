"use client";

import type { CSSProperties } from "react";
import type { StudioObject } from "./types";

type ExtendedStudioObject = StudioObject & {
  imageDataUrl?: string;
  visualType?: "image" | "chart" | "icon";
  chartType?: "bar" | "line" | "pie" | "scatter";
  chartData?: Array<{ label: string; value: number }>;
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
}) {
  const visualObject = object as ExtendedStudioObject;

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
    } catch {
      return;
    }
  };

  const pasteToCard = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    const localVisual = localStorage.getItem(VISUAL_CLIPBOARD_KEY);

    if (localVisual) {
      try {
        const parsed = JSON.parse(localVisual);

        onUpdate(object.id, {
          imageDataUrl: parsed.imageDataUrl,
          visualType: parsed.visualType,
          chartType: parsed.chartType,
          chartData: parsed.chartData,
          icon: parsed.icon,
          content: parsed.content || object.content,
        } as Partial<StudioObject>);

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
        onUpdate(object.id, {
          content: object.content ? `${object.content}\n\n${text}` : text,
          icon:
            text.length <= 4 && /\p{Extended_Pictographic}/u.test(text)
              ? text
              : object.icon,
          visualType:
            text.length <= 4 && /\p{Extended_Pictographic}/u.test(text)
              ? "icon"
              : visualObject.visualType,
        } as Partial<StudioObject>);
      }
    } catch {
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
      icon: undefined,
    } as Partial<StudioObject>);
  };

  const renderChart = () => {
    const data = visualObject.chartData || [];
    const maxValue = Math.max(...data.map((row) => row.value), 1);

    if (!data.length) {
      return (
        <textarea
          value={object.content}
          onPointerDown={(event) => event.stopPropagation()}
          onChange={(event) => onUpdate(object.id, { content: event.target.value })}
          readOnly={object.locked}
          style={textareaStyle}
          placeholder="Paste chart notes/data here or use U to upload a chart image."
        />
      );
    }

    if (visualObject.chartType === "line" || visualObject.chartType === "scatter") {
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
    if (visualObject.imageDataUrl) {
      return (
        <div style={visualBodyStyle}>
          <img
            src={visualObject.imageDataUrl}
            alt={object.title}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
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

    return (
      <textarea
        value={object.content}
        onPointerDown={(event) => event.stopPropagation()}
        onChange={(event) => onUpdate(object.id, { content: event.target.value })}
        readOnly={object.locked}
        style={textareaStyle}
      />
    );
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
        borderRadius: 18,
        padding: 14,
        boxShadow: selected
          ? "0 0 0 3px rgba(15,47,102,0.35), 0 14px 30px rgba(15,23,42,0.16)"
          : "0 10px 22px rgba(15,23,42,0.12)",
        border: connectionStart
          ? "3px solid #16a34a"
          : selected
          ? "3px solid #0f2f66"
          : "1px solid rgba(15,47,102,.12)",
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
        <strong style={{ color: "#0f2f66" }}>
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

          {(visualObject.imageDataUrl || visualObject.visualType || object.icon) ? (
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
            }}
            style={miniButtonStyle}
            title="Delete card"
          >
            ×
          </button>
        </div>
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
            background: "rgba(15,47,102,0.08)",
            color: "#0f2f66",
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
  background: "rgba(255,255,255,0.75)",
  color: "#0f2f66",
  borderRadius: 8,
  width: 24,
  height: 24,
  cursor: "pointer",
  fontWeight: 900,
  fontSize: 11,
  display: "grid",
  placeItems: "center",
};

const smallSelectStyle: CSSProperties = {
  border: "1px solid rgba(15,47,102,0.15)",
  borderRadius: 999,
  padding: "4px 8px",
  background: "white",
  color: "#0f2f66",
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
  color: "#0f172a",
  font: "inherit",
  lineHeight: 1.45,
  cursor: "text",
};

const visualBodyStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  minHeight: 0,
  borderRadius: 14,
  background: "rgba(255,255,255,0.55)",
  display: "grid",
  placeItems: "center",
  overflow: "hidden",
  padding: 10,
};

const iconBodyStyle: CSSProperties = {
  ...visualBodyStyle,
  fontSize: 54,
};

const barTrackStyle: CSSProperties = {
  width: "100%",
  height: 12,
  borderRadius: 999,
  background: "rgba(15,47,102,0.12)",
  overflow: "hidden",
};

const barFillStyle: CSSProperties = {
  height: "100%",
  borderRadius: 999,
  background: "#0f2f66",
};
