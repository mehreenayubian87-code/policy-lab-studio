"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type PosterBlock = {
  id: string;
  number: string;
  title: string;
  type: string;
  content: string;
  accent: string;
};

const initialBlocks: PosterBlock[] = [
  {
    id: "problem",
    number: "1",
    title: "The Problem",
    type: "Problem Statement",
    accent: "#f97316",
    content:
      "Describe the core policy problem, who is affected, where it occurs, and why it matters.",
  },
  {
    id: "evidence",
    number: "2",
    title: "Key Evidence",
    type: "Data & Statistics",
    accent: "#2563eb",
    content:
      "Add your strongest evidence, statistics, sources, and key findings from the Problem Studio.",
  },
  {
    id: "population",
    number: "3",
    title: "Target Population",
    type: "Users / Beneficiaries",
    accent: "#059669",
    content:
      "Describe the population affected by the problem and who the solution is designed for.",
  },
  {
    id: "stakeholders",
    number: "4",
    title: "Stakeholders & System",
    type: "Process Studio",
    accent: "#7c3aed",
    content:
      "Summarize key actors, power relationships, governance barriers, and system dynamics.",
  },
  {
    id: "solution",
    number: "5",
    title: "Proposed Solution",
    type: "Solution Studio",
    accent: "#16a34a",
    content:
      "Describe the selected solution, why it is appropriate, and how it responds to the problem.",
  },
  {
    id: "journey",
    number: "6",
    title: "User Journey",
    type: "Experience / Pathway",
    accent: "#ea580c",
    content:
      "Show how the user moves from awareness to engagement, service use, and improved outcomes.",
  },
  {
    id: "implementation",
    number: "7",
    title: "Implementation Plan",
    type: "Timeline / Activities",
    accent: "#0891b2",
    content:
      "Add implementation phases, owners, key activities, resources, and delivery milestones.",
  },
  {
    id: "risks",
    number: "8",
    title: "Risks & Mitigation",
    type: "Risk Register",
    accent: "#be123c",
    content:
      "List major risks and mitigation strategies for implementation and sustainability.",
  },
  {
    id: "indicators",
    number: "9",
    title: "Monitoring & Indicators",
    type: "Dashboard",
    accent: "#0f766e",
    content:
      "Add measurable indicators, targets, data sources, and monitoring frequency.",
  },
  {
    id: "timeline",
    number: "10",
    title: "Timeline Overview",
    type: "Milestones",
    accent: "#1d4ed8",
    content:
      "Summarize the timeline from preparation to pilot, scale-up, and sustainability.",
  },
  {
    id: "funding",
    number: "11",
    title: "Funding & Resources",
    type: "Budget / Ownership",
    accent: "#b45309",
    content:
      "Add estimated resources, funding sources, ownership, and responsible institutions.",
  },
  {
    id: "partners",
    number: "12",
    title: "Partners & Collaborators",
    type: "Team / Institutions",
    accent: "#6d28d9",
    content:
      "Add partners, collaborators, team members, course, instructor, and contact information.",
  },
];

const elementGroups = [
  {
    title: "Content Blocks",
    items: [
      ["Header", "Title, logo, subtitle"],
      ["Problem", "Problem statement"],
      ["Evidence", "Key data & statistics"],
      ["Stakeholders", "Key actors & system"],
      ["User Journey", "User journey"],
      ["Solution", "Proposed solution"],
      ["Implementation", "Key activities"],
      ["Timeline", "Phases & milestones"],
      ["Dashboard", "Indicators / metrics"],
      ["Funding", "Cost & resources"],
      ["Partners", "Collaborators"],
      ["Team", "Team information"],
    ],
  },
  {
    title: "Visual Elements",
    items: [
      ["Text Box", "Add text"],
      ["Image", "Add image"],
      ["Chart", "Add chart"],
      ["Icon", "Add icon"],
      ["Callout", "Highlight point"],
      ["Divider", "Section line"],
    ],
  },
];

export default function PosterStudioPage() {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState("problem");
  const [aiPrompt, setAiPrompt] = useState("");
  const [layoutSuggestions, setLayoutSuggestions] = useState<string[]>([]);
  const [reviewText, setReviewText] = useState("");
  const [zoom, setZoom] = useState(0.58);

  const selectedBlock = blocks.find((block) => block.id === selectedBlockId);

  const completedCount = useMemo(
    () => blocks.filter((block) => block.content.trim()).length,
    [blocks]
  );

  const updateBlock = (id: string, content: string) => {
    setBlocks((prev) =>
      prev.map((block) => (block.id === id ? { ...block, content } : block))
    );
  };

  const generateLayouts = () => {
    const prompt = aiPrompt.trim();

    setLayoutSuggestions([
      `Balanced academic layout: problem and evidence at the top, solution in the center, implementation and indicators at the bottom. ${
        prompt ? `Prompt focus: ${prompt}` : ""
      }`,
      "Storytelling layout: user journey as the central flow, supported by evidence, stakeholders, solution, and risks.",
      "Dashboard layout: evidence, indicators, timeline, and implementation metrics presented visually.",
      "Policy pitch layout: problem, solution, feasibility, implementation, and impact arranged for quick review.",
    ]);
  };

  const reviewPoster = () => {
    setReviewText(
      "AI Review: Check that the problem is specific, evidence supports the claim, the solution links to root causes, implementation has owners and timeline, and indicators are measurable."
    );
  };

  return (
    <main className="page">
      <section
        className="panelCard"
        style={{
          padding: 26,
          marginBottom: 16,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          gap: 24,
          alignItems: "center",
        }}
      >
        <div>
          <div className="fieldNote" style={{ fontWeight: 800 }}>
            POLICY LAB STUDIO
          </div>

          <h1 style={{ marginBottom: 6 }}>Poster Studio</h1>

          <p className="hero-subtitle" style={{ marginBottom: 0 }}>
            Convert your policy work into a professional conference poster.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/dashboard" className="button secondaryButton">
            Dashboard
          </Link>

          <Link href="/implementation" className="button secondaryButton">
            Previous Studio
          </Link>

          <button className="button secondaryButton" type="button">
            Preview
          </button>

          <button className="button" type="button">
            Export
          </button>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "240px minmax(0, 1fr) 240px",
          gap: 12,
          alignItems: "stretch",
          height: 760,
        }}
      >
        <aside
          className="panelCard"
          style={{
            height: "760px",
            overflowY: "auto",
            overflowX: "hidden",
            padding: 16,
          }}
        >
          <div className="panelHeader">
            <h2>Poster Elements</h2>
            <p className="fieldNote">Add elements to the poster.</p>
          </div>

          {elementGroups.map((group) => (
            <div key={group.title} style={{ marginBottom: 20 }}>
              <div
                className="fieldNote"
                style={{ fontWeight: 900, marginBottom: 10 }}
              >
                {group.title.toUpperCase()}
              </div>

              <div style={{ display: "grid", gap: 8 }}>
                {group.items.map(([title, note]) => (
                  <button
                    key={title}
                    type="button"
                    className="panelHint"
                    style={{
                      textAlign: "left",
                      cursor: "pointer",
                      border: "1px solid #e5e7eb",
                      background: "#fff",
                    }}
                    onClick={() => {
                      const target = blocks.find((block) =>
                        block.title.toLowerCase().includes(title.toLowerCase())
                      );
                      if (target) setSelectedBlockId(target.id);
                    }}
                  >
                    <strong>{title}</strong>
                    <p className="fieldNote" style={{ marginBottom: 0 }}>
                      {note}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <section
          className="panelCard"
          style={{
            padding: 0,
            overflow: "hidden",
            height: "760px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            className="panelHeader"
            style={{
              padding: 14,
              borderBottom: "1px solid rgba(15, 47, 102, 0.12)",
              marginBottom: 0,
            }}
          >
            <div>
              <h2>Poster Workspace</h2>
              <p className="fieldNote">
                Zoom, review, and edit your poster layout.
              </p>
            </div>
          </div>

          <div
            style={{
              padding: 10,
              borderBottom: "1px solid rgba(15,47,102,0.12)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
              background: "#ffffff",
            }}
          >
            <button
              type="button"
              className="button secondaryButton"
              onClick={() => setZoom((prev) => Math.max(0.35, prev - 0.08))}
            >
              −
            </button>

            <span
              className="panelHint"
              style={{ padding: "8px 12px", fontWeight: 800 }}
            >
              {Math.round(zoom * 100)}%
            </span>

            <button
              type="button"
              className="button secondaryButton"
              onClick={() => setZoom((prev) => Math.min(1.2, prev + 0.08))}
            >
              +
            </button>

            <button
              type="button"
              className="button secondaryButton"
              onClick={() => setZoom(0.58)}
            >
              Fit
            </button>

            <button
              type="button"
              className="button secondaryButton"
              onClick={() => setZoom(1)}
            >
              100%
            </button>
          </div>

          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "auto",
              background: "#eef2f7",
              padding: 18,
            }}
          >
            <div
              style={{
                width: 1500,
                minHeight: 2050,
                transform: `scale(${zoom})`,
                transformOrigin: "top left",
              }}
            >
              <div
                style={{
                  width: 1400,
                  minHeight: 1950,
                  background: "#ffffff",
                  border: "1px solid #dbe2ef",
                  boxShadow: "0 20px 50px rgba(15,47,102,.12)",
                  padding: 18,
                }}
              >
                <section
                  style={{
                    background:
                      "linear-gradient(135deg, #06265c 0%, #0f3f88 100%)",
                    color: "#ffffff",
                    borderRadius: 6,
                    padding: 26,
                    display: "grid",
                    gridTemplateColumns: "120px 1fr 180px",
                    alignItems: "center",
                    gap: 18,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      width: 92,
                      height: 92,
                      borderRadius: "50%",
                      border: "3px solid rgba(255,255,255,.8)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 42,
                    }}
                  >
                    🏫
                  </div>

                  <div>
                    <h1 style={{ color: "#ffffff", marginBottom: 6 }}>
                      POLICY POSTER TITLE
                    </h1>
                    <p style={{ marginBottom: 0 }}>
                      A policy proposal to improve outcomes through evidence,
                      implementation planning, and stakeholder engagement.
                    </p>
                  </div>

                  <div style={{ textAlign: "right", fontWeight: 700 }}>
                    Team Name
                    <br />
                    Course / Policy Lab
                    <br />
                    Instructor
                  </div>
                </section>

                <section
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0,1fr))",
                    gap: 14,
                  }}
                >
                  {blocks.map((block) => (
                    <article
                      key={block.id}
                      onClick={() => setSelectedBlockId(block.id)}
                      style={{
                        border:
                          selectedBlockId === block.id
                            ? `3px solid ${block.accent}`
                            : "1px solid #d8e0ee",
                        borderRadius: 8,
                        padding: 14,
                        minHeight:
                          block.id === "implementation" || block.id === "risks"
                            ? 190
                            : 150,
                        gridColumn:
                          block.id === "implementation" ||
                          block.id === "risks" ||
                          block.id === "partners"
                            ? "span 2"
                            : "span 1",
                        background: "#ffffff",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 10,
                        }}
                      >
                        <span
                          style={{
                            width: 26,
                            height: 26,
                            borderRadius: "50%",
                            background: block.accent,
                            color: "#ffffff",
                            display: "grid",
                            placeItems: "center",
                            fontWeight: 900,
                          }}
                        >
                          {block.number}
                        </span>

                        <strong style={{ color: "#0f2f66" }}>
                          {block.title.toUpperCase()}
                        </strong>
                      </div>

                      <p style={{ lineHeight: 1.55, marginBottom: 0 }}>
                        {block.content}
                      </p>
                    </article>
                  ))}
                </section>
              </div>
            </div>
          </div>
        </section>

        <aside
          className="panelCard"
          style={{
            height: "760px",
            overflowY: "auto",
            overflowX: "hidden",
            padding: 16,
            display: "grid",
            gap: 14,
            alignContent: "start",
          }}
        >
          <div className="panelHeader">
            <h2>AI Assistant</h2>
            <p className="fieldNote">Generate layouts and review poster.</p>
          </div>

          <div className="panelHint">
            <strong>AI Poster Generator</strong>
            <p className="fieldNote">
              Describe your poster and get 3–4 layout suggestions.
            </p>

            <textarea
              rows={5}
              value={aiPrompt}
              onChange={(event) => setAiPrompt(event.target.value)}
              placeholder="e.g. Clean layout with icons, evidence at top, timeline at bottom..."
            />

            <button
              type="button"
              className="button"
              onClick={generateLayouts}
              style={{ marginTop: 10, width: "100%" }}
            >
              Generate Layouts
            </button>
          </div>

          <div className="panelHint">
            <strong>Suggested Layouts</strong>

            {layoutSuggestions.length === 0 ? (
              <p className="fieldNote" style={{ marginBottom: 0 }}>
                Layout suggestions will appear here.
              </p>
            ) : (
              <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                {layoutSuggestions.map((layout, index) => (
                  <div key={layout} className="panelHint">
                    <strong>Layout {index + 1}</strong>
                    <p className="fieldNote" style={{ marginBottom: 0 }}>
                      {layout}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className="button secondaryButton"
            onClick={reviewPoster}
          >
            Review My Poster
          </button>

          {reviewText ? (
            <div className="panelHint">
              <strong>AI Poster Review</strong>
              <p className="fieldNote" style={{ marginBottom: 0 }}>
                {reviewText}
              </p>
            </div>
          ) : null}

          <div className="panelHint">
            <strong>Section Editor</strong>
            <p className="fieldNote" style={{ marginBottom: 0 }}>
              {selectedBlock?.title}
            </p>
          </div>

          {selectedBlock ? (
            <textarea
              rows={8}
              value={selectedBlock.content}
              onChange={(event) =>
                updateBlock(selectedBlock.id, event.target.value)
              }
            />
          ) : null}

          <div className="panelHint">
            <strong>Poster Progress</strong>
            <p className="fieldNote" style={{ marginBottom: 0 }}>
              {completedCount}/{blocks.length} sections completed
            </p>
          </div>

          <button type="button" className="button">
            Save Poster
          </button>
        </aside>
      </section>
    </main>
  );
}