import { PosterBlock, PosterHeader } from "../types";

export interface EditorProps {
  selectedBlock: PosterBlock | undefined;

  posterHeader: PosterHeader;

  selectedHeaderField: keyof PosterHeader | null;

  updateBlock: (
    id: string,
    changes: Partial<PosterBlock>
  ) => void;

  updateHeader: (
    changes: Partial<PosterHeader>
  ) => void;

  handleImageUpload: (
    event: React.ChangeEvent<HTMLInputElement>,
    blockId: string
  ) => void;

  duplicateSelectedBlock: () => void;

  deleteSelectedBlock: () => void;

  copySelectedContent: () => void;

  pasteIntoSelected: () => void;
}