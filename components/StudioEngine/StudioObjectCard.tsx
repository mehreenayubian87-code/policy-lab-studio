"use client";

import type { CSSProperties } from "react";
import type { StudioObject } from "./types";
import { connection } from "next/dist/server/web/exports";

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
  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
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
        border:
  connectionStart
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

      <textarea
        value={object.content}
        onPointerDown={(event) => event.stopPropagation()}
        onChange={(event) => onUpdate(object.id, { content: event.target.value })}
        readOnly={object.locked}
        style={{
          width: "100%",
          height: "100%",
          resize: "none",
          border: "none",
          outline: "none",
          background: "transparent",
          color: "#0f172a",
          font: "inherit",
          lineHeight: 1.45,
          cursor: object.locked ? "default" : "text",
        }}
      />

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
          <option>AI Reviewed</option>
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