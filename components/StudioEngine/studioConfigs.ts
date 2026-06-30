import type { StudioConfig } from "./types";

export const problemStudioConfig: StudioConfig = {
  storageKey: "plstudio_problem_engine_v1",
  studioId: "problem",
  title: "Problem & Evidence Studio",
  subtitle: "Build the policy problem visually",
  previousHref: "/dashboard",
  dashboardHref: "/dashboard",
  nextHref: "/stakeholder-systems",

  toolGroups: [
    { title: "Problem", tools: [{ type: "problem", label: "Problem Statement" }, { type: "hmw", label: "HMW Question" }] },
    { title: "Evidence", tools: [{ type: "evidence", label: "Evidence Card" }, { type: "statistic", label: "Statistic Card" }, { type: "source", label: "Source Card" }] },
    { title: "Analysis", tools: [{ type: "fiveWhys", label: "Five Whys" }, { type: "rootCause", label: "Root Cause" }, { type: "problemTree", label: "Problem Tree" }] },
    { title: "Users", tools: [{ type: "persona", label: "Persona" }, { type: "journey", label: "Journey Map" }] },
    { title: "Sticky Notes", collapsed: true, tools: [{ type: "sticky", label: "Sticky Note" }] },
    { title: "Visuals", collapsed: true, tools: [{ type: "chart", label: "Chart / Graph" }, { type: "aiVisual", label: "AI Visual" }] },
  ],

  guidanceCards: [
    { title: "WHAT?", prompt: "What is the focus of the problem? What exactly needs attention?", objectType: "sticky" },
    { title: "WHO?", prompt: "Who is affected by the problem? Who experiences the burden most directly?", objectType: "sticky" },
    { title: "WHERE?", prompt: "Where does this problem occur? Is it linked to a service, place, group, or setting?", objectType: "sticky" },
    { title: "WHEN?", prompt: "When does the problem occur? Is it temporary, recurring, urgent, or worsening over time?", objectType: "sticky" },
    { title: "WHY?", prompt: "Why does this problem matter for policy, equity, access, quality, or outcomes?", objectType: "sticky" },
    { title: "HOW?", prompt: "How does the problem affect people, systems, services, or implementation?", objectType: "sticky" },
    { title: "Problem Statement Formula", prompt: "The problem is [what] affecting [who] in [where/when] because [why], leading to [impact].", objectType: "problem" },
    { title: "HMW Formula", prompt: "How might we help [user/group] achieve [desired outcome] despite [barrier or constraint]?", objectType: "hmw" },
  ],

  checklist: ["Problem", "Evidence", "Root cause", "Persona", "HMW", "Ready"],

  resources: [
    { title: "Problem framing guide", type: "Template", note: "Use when drafting the problem statement." },
    { title: "Evidence use in policy", type: "Reading", note: "Use when adding evidence and statistics." },
    { title: "Persona template", type: "Template", note: "Use when identifying affected users." },
    { title: "Problem tree example", type: "Example", note: "Use for root cause analysis." },
  ],

  aiGuidance: [
    "Check whether the problem is too broad.",
    "Ask whether the evidence directly supports the problem.",
    "Suggest a persona if affected users are unclear.",
    "Suggest a problem tree if root causes are weak.",
    "Recommend a chart or evidence visual if data is available.",
  ],
};

export const processStudioConfig: StudioConfig = {
  storageKey: "plstudio_process_engine_v1",
  studioId: "process",
title: "Process Studio",
subtitle: "Understand the policy system, stakeholders, processes, and governance relationships.",
  previousHref: "/problem-evidence",
  dashboardHref: "/dashboard",
  nextHref: "/solution",

  toolGroups: [
    { title: "Stakeholders", tools: [{ type: "stakeholder", label: "Stakeholder Card" }, { type: "systemNode", label: "System Node" }] },
    { title: "Power & Relationships", tools: [{ type: "stakeholder", label: "Power / Interest Actor" }, { type: "chart", label: "Power Map" }] },
    { title: "Service Process", tools: [{ type: "journey", label: "User Journey" }, { type: "persona", label: "Affected User" }] },
    { title: "System Barriers", tools: [{ type: "rootCause", label: "System Barrier" }, { type: "problemTree", label: "System Problem Tree" }] },
    { title: "Evidence", collapsed: true, tools: [{ type: "evidence", label: "Evidence Card" }, { type: "statistic", label: "Statistic Card" }, { type: "source", label: "Source Card" }] },
    { title: "Sticky Notes", collapsed: true, tools: [{ type: "sticky", label: "Sticky Note" }] },
    { title: "AI Visuals", collapsed: true, tools: [{ type: "aiVisual", label: "AI Stakeholder/System Map" }] },
  ],

  guidanceCards: [
    { title: "Key Actors", prompt: "Who are the main actors involved in this policy problem: government, providers, communities, private sector, civil society, or users?", objectType: "stakeholder" },
    { title: "Power & Influence", prompt: "Who has authority, resources, legitimacy, data, or influence over the problem and possible solutions?", objectType: "stakeholder" },
    { title: "Affected but Less Heard", prompt: "Which groups are affected by the problem but may have limited voice in policy design or implementation?", objectType: "stakeholder" },
    { title: "System Barriers", prompt: "What service gaps, rules, incentives, norms, coordination failures, or bottlenecks shape the problem?", objectType: "systemNode" },
    { title: "Relationships", prompt: "Use connections to show which actors support, block, depend on, improve, or influence each other.", objectType: "sticky" },
    { title: "Engagement Strategy", prompt: "For each major stakeholder, should they be informed, consulted, partnered with, or empowered?", objectType: "sticky" },
  ],

  checklist: ["Key actors", "Power/interest", "Affected groups", "System barriers", "Relationships mapped", "Engagement strategy", "Ready"],

  resources: [
    { title: "Stakeholder mapping guide", type: "Framework", note: "Use to classify actors by power, interest, role, and influence." },
    { title: "Power-interest matrix", type: "Template", note: "Use to decide engagement priority and strategy." },
    { title: "Systems thinking guide", type: "Framework", note: "Use to identify feedback loops, bottlenecks, incentives, and constraints." },
    { title: "Actor relationship map", type: "Template", note: "Use connections to show support, blockage, dependency, and influence." },
  ],

  aiGuidance: [
    "Check whether all major actors are included.",
    "Ask whether affected communities are included, not only formal decision-makers.",
    "Identify missing relationships between stakeholders and system barriers.",
    "Suggest power-interest mapping if roles are unclear.",
    "Suggest system nodes if the problem is framed only as individual behavior.",
  ],
};

export const solutionStudioConfig: StudioConfig = {
  storageKey: "plstudio_solution_engine_v1",
  studioId: "solution",
  title: "Solution Design Studio",
  subtitle: "Develop, compare, and refine policy options before choosing a solution",
  previousHref: "/stakeholder-systems",
  dashboardHref: "/dashboard",
  nextHref: "/implementation",

  toolGroups: [
    { title: "Solution Options", tools: [{ type: "idea", label: "Solution Idea" }, { type: "hmw", label: "Design Question" }] },
    { title: "Theory of Change", tools: [{ type: "theoryOfChange", label: "Theory of Change" }, { type: "indicator", label: "Outcome Indicator" }] },
    { title: "Feasibility & Risks", tools: [{ type: "risk", label: "Risk Card" }, { type: "mitigation", label: "Mitigation Strategy" }, { type: "budget", label: "Resource Need" }] },
    { title: "Evidence", collapsed: true, tools: [{ type: "evidence", label: "Supporting Evidence" }, { type: "statistic", label: "Key Statistic" }, { type: "source", label: "Source Card" }] },
    { title: "Visuals", collapsed: true, tools: [{ type: "chart", label: "Prioritization Matrix" }, { type: "aiVisual", label: "AI Solution Diagram" }] },
    { title: "Sticky Notes", collapsed: true, tools: [{ type: "sticky", label: "Sticky Note" }] },
  ],

  guidanceCards: [
    { title: "Solution Option 1", prompt: "Describe one possible policy option. What does it change, for whom, and why might it work?", objectType: "idea" },
    { title: "Solution Option 2", prompt: "Describe an alternative policy option. How is it different from the first option?", objectType: "idea" },
    { title: "Feasibility", prompt: "Is this solution feasible in the current political, financial, institutional, and community context?", objectType: "sticky" },
    { title: "Equity", prompt: "Who benefits from this solution, and who might be left out or unintentionally harmed?", objectType: "sticky" },
    { title: "Theory of Change", prompt: "Inputs → Activities → Outputs → Outcomes → Impact. Explain how the solution creates change.", objectType: "theoryOfChange" },
    { title: "Assumptions", prompt: "What assumptions must hold true for this solution to work?", objectType: "risk" },
  ],

  checklist: ["At least two options", "Evidence linked", "Feasibility checked", "Equity checked", "Theory of Change", "Risks identified", "Ready"],

  resources: [
    { title: "Policy options comparison", type: "Template", note: "Use to compare options by feasibility, impact, equity, cost, and acceptability." },
    { title: "Theory of Change guide", type: "Framework", note: "Use to connect inputs, activities, outputs, outcomes, and impact." },
    { title: "Equity check", type: "Framework", note: "Use to identify who benefits and who may be excluded." },
    { title: "Prioritization matrix", type: "Template", note: "Use to select the strongest solution option." },
  ],

  aiGuidance: [
    "Check whether the solution addresses the root cause, not just the symptom.",
    "Ask whether more than one option has been considered.",
    "Suggest a theory of change if the logic is unclear.",
    "Ask whether feasibility, equity, and acceptability have been assessed.",
    "Identify possible unintended consequences.",
  ],
};

export const implementationStudioConfig: StudioConfig = {
  storageKey: "plstudio_implementation_engine_v1",
  studioId: "implementation",
  title: "Implementation Studio",
  subtitle: "Plan delivery, risks, resources, ownership, monitoring, and evaluation",
  previousHref: "/solution",
  dashboardHref: "/dashboard",
  nextHref: "/poster",

  toolGroups: [
    { title: "Implementation Plan", tools: [{ type: "timeline", label: "Timeline" }, { type: "stakeholder", label: "Responsible Actor" }, { type: "budget", label: "Budget / Resources" }] },
    { title: "Risks & Mitigation", tools: [{ type: "risk", label: "Implementation Risk" }, { type: "mitigation", label: "Mitigation Strategy" }] },
    { title: "Monitoring & Evaluation", tools: [{ type: "indicator", label: "Monitoring Indicator" }, { type: "chart", label: "Dashboard / Chart" }] },
    { title: "Evidence", collapsed: true, tools: [{ type: "evidence", label: "Implementation Evidence" }, { type: "source", label: "Reference Source" }] },
    { title: "Visuals", collapsed: true, tools: [{ type: "aiVisual", label: "AI Implementation Flow" }] },
    { title: "Sticky Notes", collapsed: true, tools: [{ type: "sticky", label: "Sticky Note" }] },
  ],

  guidanceCards: [
    { title: "Implementation Phases", prompt: "What are the main phases of implementation from launch to scale-up?", objectType: "timeline" },
    { title: "Responsible Actors", prompt: "Who owns each activity, and who supports delivery?", objectType: "stakeholder" },
    { title: "Resources", prompt: "What staff, funding, infrastructure, data, partnerships, or approvals are needed?", objectType: "budget" },
    { title: "Risks", prompt: "What could delay, block, weaken, or unintentionally harm implementation?", objectType: "risk" },
    { title: "Mitigation", prompt: "How will the team prevent, reduce, or respond to each major risk?", objectType: "mitigation" },
    { title: "Indicators", prompt: "What will be measured? Include baseline, target, data source, and reporting frequency.", objectType: "indicator" },
  ],

  checklist: ["Timeline", "Ownership", "Resources", "Risks", "Mitigation", "Indicators", "Ready for poster"],

  resources: [
    { title: "Implementation planning template", type: "Template", note: "Use to define phases, activities, owners, and timelines." },
    { title: "Risk register", type: "Template", note: "Use to document implementation risks and mitigation plans." },
    { title: "Monitoring indicator guide", type: "Framework", note: "Use to define baseline, target, source, and frequency." },
    { title: "Implementation dashboard example", type: "Example", note: "Use to decide what should be tracked visually." },
  ],

  aiGuidance: [
    "Check whether each implementation activity has an owner.",
    "Ask whether the timeline is realistic.",
    "Identify missing resources or approvals.",
    "Suggest mitigation strategies for major risks.",
    "Check whether indicators are measurable and linked to outcomes.",
  ],
};