export type PosterBlockKind =
  | "section"
  | "textbox"
  | "image"
  | "chart"
  | "icon"
  | "callout"
  | "divider";

export type PosterBlock = {
  id: string;
  number: string;
  title: string;
  type: string;
  content: string;
  accent: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: PosterBlockKind;

  imageUrl?: string;
  caption?: string;
  altText?: string;
  borderStyle?: "none" | "rounded" | "shadow" | "frame";
};

export type PosterHeader = {
  title: string;
  subtitle: string;
  logo: string;
  team: string;
  course: string;
  instructor: string;
};