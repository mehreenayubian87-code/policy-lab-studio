"use client";

import type { CSSProperties } from "react";
import type { PolicyObject } from "./types";

export default function PolicyObjectCard({
  object,
  selected,
  zoom,
  onSelect,
  onUpdate,
  onDelete,
  onDuplicate,
}: {
  object: PolicyObject;
  selected: boolean;
  zoom: number;
  onSelect: (id: string) => void;
  onUpdate: (id: string, changes: Partial<PolicyObject>) => void;
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
        x: Math.max(0, Math.round(originalX + dx)),
        y: Math.max(0, Math.round(originalY + dy)),
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
        width: Math.max(120, Math.round(originalWidth + dx)),
        height: Math.max(90, Math.round(originalHeight + dy)),
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
        onSelect(object.id);
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
        boxShadow: selected ? "0 0 0 3px rgba(212,165,116,0.36), 0 14px 30px rgba(43,88,118,0.16)" : "0 10px 22px rgba(43,88,118,0.12)",
        border: selected ? "2px solid #1e3a5f" : "1px solid rgba(43,88,118,0.14)",
        cursor: object.locked ? "default" : "grab",
        display: "grid",
        gridTemplateRows: "auto 1fr auto",
        gap: 8,
        overflow: "hidden",
        zIndex: selected ? 20 : 10,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
        <strong style={{ color: "#1e3a5f" }}>{object.icon ? `${object.icon} ` : null}{object.title}</strong>
        <div style={{ display: "flex", gap: 4 }}>
          <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onDuplicate(object.id); }} style={miniButtonStyle} title="Duplicate">⧉</button>
          <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={(event) => { event.stopPropagation(); onDelete(object.id); }} style={miniButtonStyle} title="Delete">×</button>
        </div>
      </div>

      <textarea
        value={object.content}
        onPointerDown={(event) => event.stopPropagation()}
        onChange={(event) => onUpdate(object.id, { content: event.target.value })}
        style={{ width: "100%", height: "100%", resize: "none", border: "none", outline: "none", background: "transparent", color: "#2c3e50", font: "inherit", lineHeight: 1.45 }}
      />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <select
          value={object.color}
          onPointerDown={(event) => event.stopPropagation()}
          onChange={(event) => onUpdate(object.id, { color: event.target.value })}
          style={{ border: "1px solid rgba(43,88,118,0.16)", borderRadius: 999, padding: "4px 8px", background: "white", color: "#1e3a5f", fontWeight: 700 }}
        >
          <option value="#ffd6d6">Red</option>
          <option value="#dbeafe">Blue</option>
          <option value="#fef3c7">Yellow</option>
          <option value="#e9d5ff">Purple</option>
          <option value="#dcfce7">Green</option>
          <option value="#ccfbf1">Teal</option>
          <option value="#f8fafc">White</option>
        </select>

        <button type="button" onPointerDown={startResize} style={{ border: "none", background: "rgba(212,165,116,0.22)", color: "#1e3a5f", borderRadius: 8, width: 26, height: 26, cursor: "nwse-resize", fontWeight: 900 }} title="Resize">↘</button>
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
};
