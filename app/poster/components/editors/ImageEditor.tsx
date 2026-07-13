"use client";

import type { EditorProps } from "./editorTypes";

export default function ImageEditor({
  selectedBlock,
  updateBlock,
  handleImageUpload,
  duplicateSelectedBlock,
  deleteSelectedBlock,
  copySelectedContent,
  pasteIntoSelected,
}: EditorProps) {
  if (!selectedBlock) return null;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {selectedBlock.imageUrl ? (
        <div className="panelHint">
          <strong>Image Preview</strong>

          <img
            src={selectedBlock.imageUrl}
            alt={selectedBlock.altText || selectedBlock.title}
            style={{
              width: "100%",
              maxHeight: 160,
              objectFit: "contain",
              marginTop: 10,
              borderRadius: 12,
              background: "#ffffff",
            }}
          />
        </div>
      ) : (
        <div className="panelHint">
          <strong>No image uploaded</strong>
          <p className="fieldNote" style={{ marginBottom: 0 }}>
            Upload an image to display it on the poster.
          </p>
        </div>
      )}

      <label className="button secondaryButton" style={{ cursor: "pointer" }}>
        {selectedBlock.imageUrl ? "Replace Image" : "Upload Image"}

        <input
          type="file"
          accept="image/*"
          hidden
          onChange={(event) => handleImageUpload(event, selectedBlock.id)}
        />
      </label>

      {selectedBlock.imageUrl ? (
        <button
          type="button"
          className="button secondaryButton"
          onClick={() =>
            updateBlock(selectedBlock.id, {
              imageUrl: undefined,
              content: "Image placeholder. Add caption or image notes here.",
            })
          }
        >
          Remove Image
        </button>
      ) : null}

      <label className="fieldLabel">
        <span>Caption</span>
        <textarea
          rows={3}
          value={selectedBlock.caption ?? ""}
          onChange={(event) =>
            updateBlock(selectedBlock.id, {
              caption: event.target.value,
            })
          }
          placeholder="e.g. Source: WHO, 2025"
        />
      </label>

      <label className="fieldLabel">
        <span>Alt text</span>
        <textarea
          rows={3}
          value={selectedBlock.altText ?? ""}
          onChange={(event) =>
            updateBlock(selectedBlock.id, {
              altText: event.target.value,
            })
          }
          placeholder="Briefly describe the image for accessibility."
        />
      </label>

      <label className="fieldLabel">
        <span>Image Style</span>
        <select
          value={selectedBlock.borderStyle ?? "none"}
          onChange={(event) =>
            updateBlock(selectedBlock.id, {
              borderStyle: event.target.value as
                | "none"
                | "rounded"
                | "shadow"
                | "frame",
            })
          }
        >
          <option value="none">None</option>
          <option value="rounded">Rounded corners</option>
          <option value="shadow">Shadow</option>
          <option value="frame">Frame</option>
        </select>
      </label>

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

      <button
        type="button"
        className="button secondaryButton"
        onClick={duplicateSelectedBlock}
      >
        Duplicate Image Block
      </button>

      <button
        type="button"
        className="button secondaryButton"
        onClick={deleteSelectedBlock}
      >
        Delete Image Block
      </button>
    </div>
  );
}