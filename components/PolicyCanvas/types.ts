export type PolicyObjectType =
  | "sticky"
  | "problem"
  | "evidence"
  | "statistic"
  | "persona"
  | "hmw"
  | "rootCause"
  | "problemTree"
  | "chart"
  | "aiVisual"
  | "icon";

export type PolicyObject = {
  id: string;
  type: PolicyObjectType;
  title: string;
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  icon?: string;
  locked?: boolean;
};

export type CanvasConfig = {
  storageKey: string;
  studioTitle: string;
  studioSubtitle: string;
  previousHref: string;
  nextHref: string;
  dashboardHref: string;
};
