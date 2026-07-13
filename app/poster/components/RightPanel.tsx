"use client";

import type { PosterBlock, PosterHeader } from "./types";
import HeaderEditor from "./editors/HeaderEditor";
import ImageEditor from "./editors/ImageEditor";
import ElementEditor from "./editors/ElementEditor";

type RightPanelProps = {
  selectedBlock: PosterBlock | undefined;
  posterHeader: PosterHeader;
  selectedHeaderField: keyof PosterHeader | null;
  reviewText: string;
  savedStatus: string;
  completedCount: number;
  totalCount: number;

  updateBlock: (id: string, changes: Partial<PosterBlock>) => void;
  updateHeader: (changes: Partial<PosterHeader>) => void;
  handleImageUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
    blockId: string
  ) => void;
  duplicateSelectedBlock: () => void;
  deleteSelectedBlock: () => void;
  copySelectedContent: () => void;
  pasteIntoSelected: () => void;
  importFromStudios: () => void;
  savePoster: () => void;
  reviewPoster: () => void;
};

export default function RightPanel(props: RightPanelProps) {
  const {
    selectedBlock,
    posterHeader,
    selectedHeaderField,
    reviewText,
    savedStatus,
    completedCount,
    totalCount,
    importFromStudios,
    savePoster,
    reviewPoster,
  } = props;

  return (
    <aside
      className="panelCard"
      style={{
        height: "780px",
        overflowY: "auto",
        overflowX: "hidden",
        padding: 16,
        display: "grid",
        gap: 14,
        alignContent: "start",
      }}
    >
      <div className="panelHeader">
        <h2>
          {selectedHeaderField
            ? "Header Settings"
            : selectedBlock?.kind === "image"
            ? "Image Tools"
            : selectedBlock?.kind === "chart"
            ? "Chart Tools"
            : selectedBlock?.kind === "icon"
            ? "Icon Tools"
            : "Element Tools"}
        </h2>

        <p className="fieldNote">
          Edit the selected poster item.
        </p>
      </div>

      {selectedHeaderField ? (
        <HeaderEditor {...props} />
      ) : selectedBlock?.kind === "image" ? (
        <ImageEditor {...props} />
      ) : (
        <ElementEditor {...props} />
      )}

      <div className="panelHint">
        <strong>Poster Progress</strong>
        <p className="fieldNote" style={{ marginBottom: 0 }}>
          {completedCount}/{totalCount} sections/elements completed
        </p>
      </div>

      {reviewText ? (
        <div className="panelHint">
          <strong>AI Poster Review</strong>
          <p className="fieldNote" style={{ marginBottom: 0 }}>
            {reviewText}
          </p>
        </div>
      ) : null}

      {savedStatus ? (
        <div className="savedBanner" style={{ marginTop: 0 }}>
          {savedStatus}
        </div>
      ) : null}

      <button
        type="button"
        className="button secondaryButton"
        onClick={reviewPoster}
      >
        Review My Poster
      </button>

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
  );
}