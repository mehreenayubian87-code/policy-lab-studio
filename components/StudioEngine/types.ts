export type ObjectType =
  | "sticky"
  | "problem"
  | "hmw"
  | "evidence"
  | "statistic"
  | "source"
  | "persona"
  | "journey"
  | "fiveWhys"
  | "rootCause"
  | "problemTree"
  | "stakeholder"
  | "systemNode"
  | "idea"
  | "theoryOfChange"
  | "timeline"
  | "budget"
  | "risk"
  | "mitigation"
  | "indicator"
  | "chart"
  | "aiVisual"
  | "icon";

export type StudioObject = {
  id: string;

  type: ObjectType;

  title: string;

  content: string;

  x: number;
  y: number;

  width: number;
  height: number;

  color: string;

  icon?: string;

  status?: "Draft" | "AI Reviewed" | "Professor Reviewed" | "Ready";

  createdIn?: string;

  // ---------- Phase 2 additions ----------

  posterSection?: string;

  presentationSection?: string;

  aiHint?: string;

  exportToPoster?: boolean;

  exportToPresentation?: boolean;

  tags?: string[];

  locked?: boolean;
};

export type ToolItem = {
  type: ObjectType;
  label: string;
};

export type ToolGroup = {
  title: string;
  collapsed?: boolean;
  tools: ToolItem[];
};

export type GuidanceCard = {
  title: string;
  prompt: string;
  objectType?: ObjectType;
};

export type ResourceItem = {
  title: string;
  type: "Reading" | "Template" | "Slide" | "Example" | "Framework";
  note: string;
};

export type StudioConfig = {
  storageKey: string;
  studioId: string;
  title: string;
  subtitle: string;
  previousHref: string;
  nextHref: string;
  dashboardHref: string;
  toolGroups: ToolGroup[];
  guidanceCards: GuidanceCard[];
  checklist: string[];
  resources: ResourceItem[];
  aiGuidance: string[];
};
export type StudioConnection = {
  id: string;
  fromId: string;
  toId: string;
  label: string;
  type: "causes" | "supports" | "blocks" | "depends on" | "improves" | "related to";
};