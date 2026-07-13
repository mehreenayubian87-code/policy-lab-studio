"use client";

import type { EditorProps } from "./editorTypes";

export default function ElementEditor({
  selectedBlock,
  updateBlock,
  duplicateSelectedBlock,
  deleteSelectedBlock,
  copySelectedContent,
  pasteIntoSelected,
}: EditorProps) {
  if (!selectedBlock) return null;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <label className="fieldLabel">
        <span>Title</span>

        <input
          value={selectedBlock.title}
          onChange={(e) =>
            updateBlock(selectedBlock.id, {
              title: e.target.value,
            })
          }
        />
      </label>

      <label className="fieldLabel">
        <span>Type / Caption</span>

        <input
          value={selectedBlock.type}
          onChange={(e) =>
            updateBlock(selectedBlock.id, {
              type: e.target.value,
            })
          }
        />
      </label>

      <label className="fieldLabel">
        <span>Content</span>

        <textarea
          rows={8}
          value={selectedBlock.content}
          onChange={(e) =>
            updateBlock(selectedBlock.id, {
              content: e.target.value,
            })
          }
        />
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
        Duplicate Element
      </button>

      <button
        type="button"
        className="button secondaryButton"
        onClick={deleteSelectedBlock}
        disabled={selectedBlock.kind === "section"}
      >
        Delete Element
      </button>
    </div>
  );
}