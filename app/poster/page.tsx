"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";

type TeamMember = { name: string; role?: string };
type Team = {
  groupNumber?: number;
  groupName?: string;
  courseName?: string;
  instructorName?: string;
  students?: TeamMember[];
};

type LibraryItem = {
  id: string;
  studio: string;
  group: string;
  title: string;
  content: string;
  target: string;
  visualOptions: string[];
};

type PosterSection = {
  id: string;
  title: string;
  subtitle: string;
  content: string[];
  visuals: string[];
  status: "empty" | "added" | "review";
};

type SimpleEntry = {
  id: string;
  text: string;
  author: string;
  timestamp: string;
};

const now = () => new Date().toISOString();

const posterTemplate: PosterSection[] = [
  { id: "problem", title: "1. Problem & Context", subtitle: "What is the issue and why does it matter?", content: [], visuals: [], status: "empty" },
  { id: "persona", title: "2. Persona / Beneficiaries", subtitle: "Who is affected?", content: [], visuals: [], status: "empty" },
  { id: "stakeholders", title: "3. Stakeholders & System", subtitle: "Who is involved in the system?", content: [], visuals: [], status: "empty" },
  { id: "solution", title: "4. Proposed Solution", subtitle: "What are you proposing?", content: [], visuals: [], status: "empty" },
  { id: "theory", title: "5. Theory of Change", subtitle: "How will the solution create impact?", content: [], visuals: [], status: "empty" },
  { id: "implementation", title: "6. Implementation Overview", subtitle: "How will it be delivered?", content: [], visuals: [], status: "empty" },
  { id: "timeline", title: "7. Timeline & Milestones", subtitle: "When will it happen?", content: [], visuals: [], status: "empty" },
  { id: "budget", title: "8. Budget Overview", subtitle: "What will it cost?", content: [], visuals: [], status: "empty" },
  { id: "risks", title: "9. Risks", subtitle: "What could go wrong?", content: [], visuals: [], status: "empty" },
  { id: "mitigation", title: "10. Mitigation Strategies", subtitle: "How will risks be managed?", content: [], visuals: [], status: "empty" },
  { id: "monitoring", title: "11. Monitoring & Evaluation", subtitle: "How will success be measured?", content: [], visuals: [], status: "empty" },
  { id: "outcomes", title: "12. Expected Outcomes & Impact", subtitle: "What change do we expect?", content: [], visuals: [], status: "empty" },
  { id: "sustainability", title: "13. Sustainability & Scale-Up", subtitle: "How will it last and grow?", content: [], visuals: [], status: "empty" },
  { id: "references", title: "14. References", subtitle: "Sources and evidence base", content: [], visuals: [], status: "empty" },
  { id: "team", title: "15. Team", subtitle: "Team members and acknowledgements", content: [], visuals: [], status: "empty" },
];

const library: LibraryItem[] = [
  { id: "problem-statement", studio: "Problem & Context", group: "Problem Studio", title: "Problem Statement", content: "One-line problem statement from Problem Studio will appear here after students save their work.", target: "problem", visualOptions: ["Problem Tree", "Evidence Summary", "Issue Card"] },
  { id: "root-causes", studio: "Problem & Context", group: "Problem Studio", title: "Root Causes", content: "Root causes, barriers, and underlying drivers.", target: "problem", visualOptions: ["Root Cause Tree", "Fishbone Diagram", "Five Whys"] },
  { id: "evidence", studio: "Problem & Context", group: "Problem Studio", title: "Evidence Summary", content: "Key evidence, statistics, sources, and rationale.", target: "problem", visualOptions: ["Evidence Infographic", "Bar Chart", "Evidence Cards"] },
  { id: "persona", studio: "Problem & Context", group: "Problem Studio", title: "Persona", content: "Persona, user experience, needs, and pain points.", target: "persona", visualOptions: ["Persona Card", "User Journey", "Needs Map"] },
  { id: "hmw", studio: "Problem & Context", group: "Problem Studio", title: "How Might We Question", content: "Final HMW question.", target: "problem", visualOptions: ["HMW Callout", "Problem-to-Opportunity Card"] },

  { id: "stakeholder-map", studio: "Process & Stakeholders", group: "Process Studio", title: "Stakeholder Map", content: "Stakeholders identified in Process Studio.", target: "stakeholders", visualOptions: ["Stakeholder Map", "Concentric Circles", "Network Map"] },
  { id: "power-interest", studio: "Process & Stakeholders", group: "Process Studio", title: "Power–Interest Matrix", content: "Power, interest, influence, and engagement needs.", target: "stakeholders", visualOptions: ["Power–Interest Matrix", "Influence Matrix", "Engagement Grid"] },
  { id: "system-map", studio: "Process & Stakeholders", group: "Process Studio", title: "System Map", content: "System actors, relationships, gaps, and opportunities.", target: "stakeholders", visualOptions: ["System Map", "Relationship Diagram", "Process Flow"] },
  { id: "policy-canvas", studio: "Process & Stakeholders", group: "Process Studio", title: "Policy Canvas", content: "Policy canvas content including problem, actors, resources, and constraints.", target: "stakeholders", visualOptions: ["Policy Canvas Summary", "Process Canvas", "Opportunity Map"] },

  { id: "selected-solution", studio: "Solution Design", group: "Solution Studio", title: "Selected Solution", content: "Selected intervention or policy solution.", target: "solution", visualOptions: ["Solution Card", "Feature Icons", "Value Proposition"] },
  { id: "theory-change", studio: "Solution Design", group: "Solution Studio", title: "Theory of Change", content: "Inputs, activities, outputs, outcomes, and impact pathway.", target: "theory", visualOptions: ["Theory of Change Diagram", "Logic Model", "Impact Pathway"] },
  { id: "beneficiaries", studio: "Solution Design", group: "Solution Studio", title: "Beneficiaries", content: "Primary and secondary beneficiaries.", target: "persona", visualOptions: ["Beneficiary Map", "Impact Groups", "User Segments"] },
  { id: "success-indicators", studio: "Solution Design", group: "Solution Studio", title: "Success Indicators", content: "Key metrics and success indicators from Solution Studio.", target: "monitoring", visualOptions: ["Indicator Cards", "Outcome Chain", "Success Metrics"] },

  { id: "governance", studio: "Implementation", group: "Implementation Studio", title: "Governance & Ownership", content: "Lead organization, supporting actors, ownership, accountability, and reporting arrangements.", target: "implementation", visualOptions: ["Governance Structure", "Ownership Map", "Roles Diagram"] },
  { id: "activities", studio: "Implementation", group: "Implementation Studio", title: "Activities Plan", content: "Implementation activities, owners, resources, timeline, and indicators.", target: "implementation", visualOptions: ["Activity Table", "Workplan", "Delivery Flow"] },
  { id: "timeline", studio: "Implementation", group: "Implementation Studio", title: "Timeline & Milestones", content: "Phases, milestones, dependencies, and critical deadlines.", target: "timeline", visualOptions: ["Roadmap", "Gantt Chart", "Milestone Timeline"] },
  { id: "budget-total", studio: "Implementation", group: "Implementation Studio", title: "Budget: Total Budget", content: "Total estimated budget.", target: "budget", visualOptions: ["Total Budget Box", "Funding Summary", "Budget Highlight"] },
  { id: "budget-breakdown", studio: "Implementation", group: "Implementation Studio", title: "Budget: Breakdown", content: "Budget categories, estimated costs, funding sources, and justifications.", target: "budget", visualOptions: ["Budget Breakdown", "Pie Chart", "Budget Table", "Cost Category Bar Chart"] },
  { id: "funding-sources", studio: "Implementation", group: "Implementation Studio", title: "Budget: Funding Sources", content: "Government, grants, donors, private sector, university, or mixed funding.", target: "budget", visualOptions: ["Funding Distribution", "Donut Chart", "Funding Table"] },
  { id: "risk-register", studio: "Implementation", group: "Implementation Studio", title: "Risks: Risk Register", content: "Risks, categories, likelihood, impact, and risk level.", target: "risks", visualOptions: ["Risk Register", "Risk Heat Map", "Risk Cards"] },
  { id: "mitigation", studio: "Implementation", group: "Implementation Studio", title: "Mitigation Strategies", content: "Mitigation strategies, contingency plans, risk response actions, and escalation plan.", target: "mitigation", visualOptions: ["Risk–Mitigation Table", "Mitigation Matrix", "Contingency Flow"] },
  { id: "monitoring", studio: "Implementation", group: "Implementation Studio", title: "Monitoring Indicators", content: "Indicators, targets, data sources, frequency, and responsible actors.", target: "monitoring", visualOptions: ["M&E Scorecard", "KPI Dashboard", "Traffic Light Dashboard"] },
  { id: "sustainability", studio: "Implementation", group: "Implementation Studio", title: "Sustainability & Scale-Up", content: "Long-term ownership, financial sustainability, scale-up strategy, and policy integration.", target: "sustainability", visualOptions: ["Sustainability Wheel", "Scale-Up Roadmap", "Sustainability Framework"] },

  { id: "references", studio: "Supporting Material", group: "Resource Hub", title: "References", content: "References, readings, sources, and course materials.", target: "references", visualOptions: ["Reference List", "Evidence Footnotes"] },
];

export default function PosterStudio() {
  const [team, setTeam] = useState<Team | null>(null);
  const [editor, setEditor] = useState("");
  const [saved, setSaved] = useState("");
  const [expandedGroup, setExpandedGroup] = useState("Problem Studio");
  const [selectedItem, setSelectedItem] = useState<LibraryItem | null>(library[0]);
  const [selectedTarget, setSelectedTarget] = useState(library[0].target);
  const [posterSections, setPosterSections] = useState<PosterSection[]>(posterTemplate);
  const [layoutChoice, setLayoutChoice] = useState("");
  const [aiMessage, setAiMessage] = useState("");
  const [profRequestDraft, setProfRequestDraft] = useState("");
  const [professorRequests, setProfessorRequests] = useState<SimpleEntry[]>([]);

  useEffect(() => {
    try {
      const rawTeam = localStorage.getItem("plstudio_team");
      if (rawTeam) {
        const parsed = JSON.parse(rawTeam);
        setTeam(parsed);
        setEditor(parsed.students?.[0]?.name || parsed.instructorName || "");
      }
      const rawPoster = localStorage.getItem("plstudio_poster_canvas_v1");
      if (rawPoster) {
        const data = JSON.parse(rawPoster);
        if (Array.isArray(data.posterSections) && data.posterSections.length > 0) {
          setPosterSections(data.posterSections);
        }
        if (data.layoutChoice) setLayoutChoice(data.layoutChoice);
        if (Array.isArray(data.professorRequests)) setProfessorRequests(data.professorRequests);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const members = useMemo(() => {
    const list = [
      ...(team?.students ?? []),
      ...(team?.instructorName ? [{ name: team.instructorName, role: "Instructor" }] : []),
    ];
    return list.filter(
      (member, index, arr) =>
        member.name && index === arr.findIndex((item) => item.name === member.name)
    );
  }, [team]);

  const groups = useMemo(() => Array.from(new Set(library.map((item) => item.group))), []);
  const completed = posterSections.filter((section) => section.status !== "empty").length;
  const completionPercent = Math.round((completed / posterSections.length) * 100);

  const saveProgress = () => {
    localStorage.setItem(
      "plstudio_poster_canvas_v1",
      JSON.stringify({ posterSections, layoutChoice, professorRequests, savedBy: editor, savedAt: now() })
    );
    setSaved("Progress saved.");
    setTimeout(() => setSaved(""), 2000);
  };

  const addToPoster = () => {
    if (!selectedItem) return;
    setPosterSections((prev) =>
      prev.map((section) =>
        section.id === selectedTarget
          ? { ...section, content: [...section.content, selectedItem.content], status: "added" }
          : section
      )
    );
  };

  const addVisualToPoster = (visual: string) => {
    if (!selectedItem) return;
    setPosterSections((prev) =>
      prev.map((section) =>
        section.id === selectedTarget
          ? { ...section, visuals: [...section.visuals, visual], status: "added" }
          : section
      )
    );
  };

  const removeContent = (sectionId: string, index: number) => {
    setPosterSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              content: section.content.filter((_, i) => i !== index),
              status:
                section.content.length <= 1 && section.visuals.length === 0
                  ? "empty"
                  : section.status,
            }
          : section
      )
    );
  };

  const removeVisual = (sectionId: string, index: number) => {
    setPosterSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              visuals: section.visuals.filter((_, i) => i !== index),
              status:
                section.content.length === 0 && section.visuals.length <= 1
                  ? "empty"
                  : section.status,
            }
          : section
      )
    );
  };

  const clearPoster = () => {
    setPosterSections(posterTemplate);
    localStorage.removeItem("plstudio_poster_canvas_v1");
    setSaved("Poster canvas reset.");
    setTimeout(() => setSaved(""), 2000);
  };

  const addProfessorRequest = () => {
    if (!profRequestDraft.trim()) return;
    setProfessorRequests((prev) => [
      { id: String(Date.now()), text: profRequestDraft, author: editor || "Team", timestamp: now() },
      ...prev,
    ]);
    setProfRequestDraft("");
  };

  const runPosterInspector = () => {
    const missing = posterSections.filter((section) => section.status === "empty").map((section) => section.title);
    if (missing.length === 0) {
      setAiMessage("Poster Inspector: All major poster sections have content. Next, check clarity, evidence, text length, and visual balance.");
    } else {
      setAiMessage(`Poster Inspector: Missing or empty sections include ${missing.slice(0, 6).join(", ")}${missing.length > 6 ? "..." : ""}.`);
    }
  };

  const layoutSuggestions = [
    { id: "clean", title: "Clean & Professional", desc: "Best for formal academic presentation with clear section flow." },
    { id: "visual", title: "Visual Impact", desc: "Best when graphs, maps, diagrams, and icons are central to the story." },
    { id: "balanced", title: "Balanced & Modern", desc: "Good balance between text, visuals, and implementation detail." },
    { id: "data", title: "Data Focused", desc: "Best when evidence, budget, metrics, and outcomes are strongest." },
  ];

  return (
    <main className="page">
      <div className="studioPageHeading panelCard" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 0.8fr)", gap: 24, alignItems: "center", marginBottom: 18, padding: 24 }}>
        <div>
          <div className="fieldNote" style={{ fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>Studio 5</div>
          <h1 style={{ marginBottom: 6 }}>Poster Studio</h1>
          <p className="hero-subtitle" style={{ marginBottom: 10 }}>Assemble the final poster by pulling content from all previous studios.</p>
          <p style={{ maxWidth: 760, marginBottom: 0 }}>Use the content library, add items into the poster template, generate visual ideas, and choose a layout direction. This studio should feel like a poster assembly workspace, not another form.</p>
        </div>

        <div className="panelHint" style={{ display: "grid", gap: 12 }}>
          <div className="fieldLabel" style={{ marginBottom: 0 }}>
            <label>Who is currently editing?</label>
            <select value={editor} onChange={(event) => setEditor(event.target.value)}>
              <option value="">Select editor</option>
              {members.map((member) => <option key={member.name} value={member.name}>{member.name}</option>)}
            </select>
          </div>

          <div className="actionRow" style={{ justifyContent: "flex-start", gap: 10, flexWrap: "wrap" }}>
            <Link className="button secondaryButton" href="/implementation">Previous Studio</Link>
           <Link className="button" href="/portfolio">
  Next Studio
</Link>
            <Link className="button secondaryButton" href="/dashboard">Back to Dashboard</Link>
          </div>

          {saved ? <div className="savedBanner" style={{ marginTop: 0 }}>{saved}</div> : null}
        </div>
      </div>

      <div className="panelCard" style={{ marginBottom: 18 }}>
        <div className="panelHeader">
          <h3>Poster Progress</h3>
          <p className="fieldNote">{completed} of {posterSections.length} poster sections have content or visuals</p>
        </div>
        <div style={{ height: 10, borderRadius: 999, background: "rgba(15, 23, 42, 0.08)" }}>
          <div style={{ width: `${completionPercent}%`, height: "100%", borderRadius: 999, background: "#0f2f66" }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "290px minmax(0, 1fr) 320px", gap: 18, alignItems: "start" }}>
        <aside className="panelCard" style={{ position: "sticky", top: 18 }}>
          <div className="panelHeader">
            <h3>Poster Content Library</h3>
            <p className="fieldNote">Open a studio section, select content, then add it to the poster.</p>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {groups.map((group) => {
              const items = library.filter((item) => item.group === group);
              const open = expandedGroup === group;
              return (
                <div key={group} className="panelHint" style={{ padding: 10 }}>
                  <button type="button" onClick={() => setExpandedGroup(open ? "" : group)} style={{ border: "none", background: "transparent", color: "#0f2f66", fontWeight: 800, cursor: "pointer", width: "100%", textAlign: "left", padding: 0 }}>
                    {open ? "▾" : "▸"} {group} <span className="fieldNote">({items.length})</span>
                  </button>

                  {open ? (
                    <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                      {items.map((item) => (
                        <button key={item.id} type="button" onClick={() => { setSelectedItem(item); setSelectedTarget(item.target); }} className="panelHint" style={{ textAlign: "left", border: selectedItem?.id === item.id ? "2px solid #0f2f66" : "1px solid rgba(15, 23, 42, 0.08)", cursor: "pointer" }}>
                          <strong>{item.title}</strong>
                          <p className="fieldNote" style={{ marginBottom: 0 }}>{item.studio}</p>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </aside>

        <section className="panelCard">
          <div className="panelHeader">
            <h2>Poster Workspace</h2>
            <p className="fieldNote">Structured template. Later this can become true drag-and-drop.</p>
          </div>

          <div className="workspaceCanvas" style={{ padding: 18, minHeight: 980, background: "linear-gradient(rgba(15,47,102,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(15,47,102,0.04) 1px, transparent 1px)", backgroundSize: "24px 24px" }}>
            <div className="panelCard" style={{ textAlign: "center", marginBottom: 12, padding: 18 }}>
              <strong style={{ fontSize: "1.5rem" }}>POSTER TITLE GOES HERE</strong>
              <p className="fieldNote" style={{ marginBottom: 0 }}>Team Name | Course Name | Instructor | Date</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
              {posterSections.map((section) => (
                <PosterDropZone key={section.id} section={section} onRemoveContent={removeContent} onRemoveVisual={removeVisual} />
              ))}
            </div>
          </div>

          <div className="actionRow" style={{ marginTop: 18, justifyContent: "flex-start", gap: 10, flexWrap: "wrap" }}>
            <button type="button" className="button" onClick={saveProgress}>Save Draft</button>
            <button type="button" className="button secondaryButton" onClick={runPosterInspector}>Check Completeness</button>
            <button type="button" className="button secondaryButton" onClick={clearPoster}>Reset Poster</button>
          </div>
        </section>

        <aside style={{ display: "grid", gap: 16 }}>
          <SidebarPanel title="Selected Content">
            {selectedItem ? (
              <>
                <div className="panelHint">
                  <strong>{selectedItem.title}</strong>
                  <p className="fieldNote">Source: {selectedItem.group}</p>
                  <p className="fieldNote" style={{ marginBottom: 0 }}>{selectedItem.content}</p>
                </div>

                <div className="fieldLabel">
                  <label>Add to poster section</label>
                  <select value={selectedTarget} onChange={(event) => setSelectedTarget(event.target.value)}>
                    {posterSections.map((section) => <option key={section.id} value={section.id}>{section.title}</option>)}
                  </select>
                </div>

                <button type="button" className="button" onClick={addToPoster}>Add Content to Poster</button>
              </>
            ) : <p className="fieldNote">Select an item from the content library.</p>}
          </SidebarPanel>

          <SidebarPanel title="AI Assistant & Visuals">
            <p className="fieldNote">Select content, then choose a poster-ready visual idea. Phase 2 will generate the actual visual from student inputs.</p>
            {selectedItem?.visualOptions.map((visual) => (
              <button key={visual} type="button" className="panelHint" onClick={() => addVisualToPoster(visual)} style={{ textAlign: "left", cursor: "pointer", border: "1px solid rgba(15, 47, 102, 0.16)" }}>✨ {visual}</button>
            ))}
            <button type="button" className="button secondaryButton" onClick={() => setAiMessage("AI Visual Generator placeholder: this will convert completed studio data into charts, maps, matrices, timelines, and poster-ready graphics.")}>Generate Custom Visual</button>
            {aiMessage ? <div className="panelHint">{aiMessage}</div> : null}
          </SidebarPanel>

          <SidebarPanel title="AI Layout Suggestions">
            <p className="fieldNote">Once the poster has content, AI can suggest 3–4 layout options based on what students have added.</p>
            <div style={{ display: "grid", gap: 10 }}>
              {layoutSuggestions.map((layout) => (
                <button key={layout.id} type="button" className="panelHint" onClick={() => setLayoutChoice(layout.title)} style={{ textAlign: "left", cursor: "pointer", border: layoutChoice === layout.title ? "2px solid #0f2f66" : "1px solid rgba(15, 23, 42, 0.08)" }}>
                  <strong>{layout.title}</strong>
                  <p className="fieldNote" style={{ marginBottom: 0 }}>{layout.desc}</p>
                </button>
              ))}
            </div>
            {layoutChoice ? <div className="savedBanner">Selected layout: {layoutChoice}</div> : null}
          </SidebarPanel>

          <SidebarPanel title="Poster Inspector">
            <p className="fieldNote">Checks missing content, weak alignment, text overload, and missing visuals.</p>
            <button type="button" className="button secondaryButton" onClick={runPosterInspector}>Run Poster Inspector</button>
          </SidebarPanel>

          <SidebarPanel title="Professor Review">
            <FieldArea label="Question for professor" value={profRequestDraft} onChange={setProfRequestDraft} />
            <button type="button" className="button" onClick={addProfessorRequest}>Submit Review Request</button>
            {professorRequests.map((item) => <SavedItem key={item.id} item={item} />)}
          </SidebarPanel>
        </aside>
      </div>
    </main>
  );
}

function PosterDropZone({ section, onRemoveContent, onRemoveVisual }: { section: PosterSection; onRemoveContent: (sectionId: string, index: number) => void; onRemoveVisual: (sectionId: string, index: number) => void }) {
  return (
    <div className="panelHint" style={{ minHeight: section.id === "theory" || section.id === "implementation" ? 190 : 150, border: section.status === "empty" ? "1px dashed rgba(15, 47, 102, 0.35)" : "2px solid rgba(15, 47, 102, 0.24)", background: section.status === "empty" ? "rgba(255,255,255,0.72)" : "rgba(255,255,255,0.95)", display: "grid", alignContent: "start", gap: 8 }}>
      <strong>{section.title}</strong>
      <p className="fieldNote" style={{ marginBottom: 4 }}>{section.subtitle}</p>

      {section.content.length === 0 && section.visuals.length === 0 ? <p className="fieldNote" style={{ marginBottom: 0 }}>Drag or add content here.</p> : null}

      {section.content.map((content, index) => (
        <div key={`${section.id}-${index}`} className="panelNote">
          <div>{content}</div>
          <button type="button" onClick={() => onRemoveContent(section.id, index)} style={{ border: "none", background: "transparent", color: "#b91c1c", fontWeight: 800, cursor: "pointer", marginTop: 6 }}>Remove</button>
        </div>
      ))}

      {section.visuals.map((visual, index) => (
        <div key={`${visual}-${index}`} className="panelHint" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 700 }}>
          <span>✨ Visual: {visual}</span>
          <button type="button" onClick={() => onRemoveVisual(section.id, index)} title="Remove visual" style={{ border: "none", background: "transparent", color: "#b91c1c", cursor: "pointer", fontWeight: 900, fontSize: "18px", lineHeight: 1 }}>×</button>
        </div>
      ))}
    </div>
  );
}

function FieldArea({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <div className="fieldLabel"><label>{label}</label><textarea rows={3} value={value} onChange={(event) => onChange(event.target.value)} /></div>;
}

function SidebarPanel({ title, children }: { title: string; children: ReactNode }) {
  return <div className="panelCard"><div className="panelHeader"><h3>{title}</h3></div><div style={{ display: "grid", gap: 12 }}>{children}</div></div>;
}

function SavedItem({ item }: { item: SimpleEntry }) {
  return <div className="panelNote"><div>{item.text}</div><div className="fieldNote">{item.author || "Team"} · {new Date(item.timestamp).toLocaleString()}</div></div>;
}
