import type { PolicyObject, PolicyObjectType } from "./types";

export const objectPresets: Record<PolicyObjectType, Omit<PolicyObject, "id" | "x" | "y">> = {
  sticky: { type: "sticky", title: "Sticky Note", content: "Write a quick idea, question, or observation.", width: 210, height: 150, color: "#fff7c2", icon: "📝" },
  problem: { type: "problem", title: "Problem Statement", content: "Define the policy problem in one clear sentence.", width: 280, height: 170, color: "#ffd6d6", icon: "🔍" },
  evidence: { type: "evidence", title: "Evidence Card", content: "Add evidence, literature, reports, or field observations.", width: 300, height: 180, color: "#dbeafe", icon: "📚" },
  statistic: { type: "statistic", title: "Statistic Card", content: "Add one key statistic and its source.", width: 260, height: 160, color: "#dbeafe", icon: "📊" },
  persona: { type: "persona", title: "Persona Card", content: "Describe the affected user: needs, barriers, goals, and context.", width: 300, height: 260, color: "#fef3c7", icon: "👤" },
  hmw: { type: "hmw", title: "How Might We", content: "How might we help [user] achieve [goal] despite [barrier]?", width: 320, height: 160, color: "#fde68a", icon: "❓" },
  rootCause: { type: "rootCause", title: "Root Cause Card", content: "What are the deeper causes behind the visible problem?", width: 300, height: 190, color: "#e9d5ff", icon: "🌱" },
  problemTree: { type: "problemTree", title: "Problem Tree", content: "Causes → Core Problem → Effects", width: 360, height: 240, color: "#ede9fe", icon: "🌳" },
  chart: { type: "chart", title: "Chart / Graph", content: "Chart placeholder. Later AI will generate a real visual from data.", width: 380, height: 240, color: "#dcfce7", icon: "📈" },
  aiVisual: { type: "aiVisual", title: "AI Visual", content: "AI-generated visual placeholder based on your prompt.", width: 380, height: 240, color: "#ccfbf1", icon: "✨" },
  icon: { type: "icon", title: "Icon", content: "Icon object", width: 120, height: 120, color: "#f8fafc", icon: "⭐" },
};
