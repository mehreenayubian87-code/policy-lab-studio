"use client";

import Link from "next/link";

type Studio = {
  number: string;
  title: string;
  href: string;
  status: "Available";
  phase: string;
  description: string;
  output: string;
};

const studios: Studio[] = [
  {
    number: "01",
    title: "Problem & Evidence Studio",
    href: "/problem-evidence",
    status: "Available",
    phase: "Understand",
    description:
      "Explore the policy problem, organise evidence, identify assumptions, develop a persona if useful, and draft a How Might We question.",
    output:
      "Problem frame, evidence notes, assumptions, HMW question, and poster-ready problem content.",
  },
  {
    number: "02",
    title: "Process Studio",
    href: "/stakeholder-systems",
    status: "Available",
    phase: "Map",
    description:
      "Map stakeholders, participation structure, power dynamics, process approach, policy canvas, system relationships, gaps, and opportunities.",
    output:
      "Stakeholder analysis, participation layers, approach canvas, process wheel, policy canvas, system map, and opportunity areas.",
  },
  {
    number: "03",
    title: "Solution Studio",
    href: "/solution",
    status: "Available",
    phase: "Design",
    description:
      "Generate intervention ideas, frame solution options, build a hypothesis of change, develop a theory of change, and plan rollout logic.",
    output:
      "Solution options, hypothesis of change, theory of change, beneficiaries, delivery model, risks, metrics, and rollout strategy.",
  },
  {
    number: "04",
    title: "Implementation Studio",
    href: "/implementation",
    status: "Available",
    phase: "Plan",
    description:
      "Plan how the selected solution could be implemented, including governance, activities, timeline, budget, risks, mitigation, monitoring, and scale-up.",
    output:
      "Implementation plan, activity table, budget plan, risk notes, mitigation plan, timeline, monitoring indicators, and delivery considerations.",
  },
  {
    number: "05",
    title: "Poster Studio",
    href: "/poster",
    status: "Available",
    phase: "Assemble",
    description:
      "Assemble the final policy poster by bringing together outputs from previous studios, organising content, planning visuals, and preparing the poster for review.",
    output:
      "Poster canvas, content library, visual planning, AI layout suggestions, professor review, and poster-ready content.",
  },
  {
    number: "06",
    title: "Policy Portfolio",
    href: "/portfolio",
    status: "Available",
    phase: "Explore",
    description:
      "Browse previous policy posters in a gallery format to get inspiration, explore topics, and save examples.",
    output:
      "Curated poster gallery, category filters, poster previews, keywords, and saved inspiration collection.",
  },
  {
    number: "07",
    title: "Presentation Studio",
    href: "/presentation",
    status: "Available",
    phase: "Present",
    description:
      "Prepare the final presentation using work completed in previous studios, assign speakers, rehearse the pitch, and practice likely judges' questions.",
    output:
      "Presentation flow, speaker assignments, pitch script, judges' Q&A practice, AI coaching, and final readiness checklist.",
  },
];

export default function Dashboard() {
  return (
    <main className="page">
      <section
        className="panelCard"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.35fr) minmax(280px, 0.75fr)",
          gap: 24,
          alignItems: "center",
          padding: 30,
          marginBottom: 22,
        }}
      >
        <div>
          <h1 style={{ marginBottom: 8 }}>Studio Dashboard</h1>

          <h2
            style={{
              fontSize: "1.6rem",
              fontWeight: 600,
              color: "#42526b",
              marginBottom: 14,
              lineHeight: 1.25,
            }}
          >
            Follow the complete Policy Lab journey
          </h2>

          <p className="hero-subtitle" style={{ marginBottom: 10 }}>
            Move step by step from problem exploration to process mapping, solution design,
            implementation planning, poster creation, portfolio exploration, and final presentation.
          </p>

          <p style={{ maxWidth: 900, marginBottom: 0 }}>
            Each studio builds on the previous one. Students should complete the workflow in sequence,
            save progress, and use professor feedback before final submission.
          </p>
        </div>

        <div className="panelHint" style={{ display: "grid", gap: 12 }}>
          <strong>Current pathway</strong>

          <p className="fieldNote" style={{ margin: 0 }}>
            Problem → Process → Solution → Implementation → Poster → Portfolio → Presentation
          </p>

          <div className="actionRow" style={{ justifyContent: "flex-start", gap: 10, flexWrap: "wrap" }}>
            <Link href="/" className="button secondaryButton">
              Back to Home
            </Link>

            <Link href="/problem-evidence" className="button">
              Start Studio 1
            </Link>
          </div>
        </div>
      </section>

      <section className="panelCard" style={{ marginBottom: 22 }}>
        <div className="panelHeader">
          <h2>Policy Lab Pathway</h2>
          <p className="fieldNote">
            This is the complete learning sequence for the Policy Lab Studio.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
            gap: 10,
          }}
        >
          {studios.map((studio) => (
            <Link
              key={studio.number}
              href={studio.href}
              className="panelHint"
              style={{
                textDecoration: "none",
                color: "inherit",
                minHeight: 110,
                display: "grid",
                alignContent: "space-between",
                border: "1px solid rgba(15, 47, 102, 0.12)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                <strong style={{ color: "#0f2f66" }}>{studio.number}</strong>
                <span className="fieldNote">{studio.phase}</span>
              </div>

              <strong>{studio.title.replace(" Studio", "")}</strong>
            </Link>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: 22 }}>
        <div className="panelHeader">
          <h2>Available Studios</h2>
          <p className="fieldNote">
            All core studios are now available in the main workflow.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 18,
          }}
        >
          {studios.map((studio) => (
            <Link
              key={studio.title}
              href={studio.href}
              className="panelCard"
              style={{
                textDecoration: "none",
                color: "inherit",
                display: "grid",
                gap: 12,
                border: "2px solid rgba(15, 47, 102, 0.12)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div
                  className="panelHint"
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: 18,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 900,
                    color: "#0f2f66",
                  }}
                >
                  {studio.number}
                </div>

                <div style={{ display: "grid", justifyItems: "end", gap: 6 }}>
                  <span
                    className="panelHint"
                    style={{
                      borderRadius: 999,
                      padding: "7px 11px",
                      fontWeight: 800,
                      color: "#0f2f66",
                      alignSelf: "start",
                    }}
                  >
                    {studio.status}
                  </span>

                  <span className="fieldNote">{studio.phase}</span>
                </div>
              </div>

              <div>
                <h3 style={{ marginBottom: 8 }}>{studio.title}</h3>

                <p className="fieldNote" style={{ marginBottom: 12 }}>
                  {studio.description}
                </p>

                <div className="panelHint">
                  <strong>Output:</strong>
                  <p className="fieldNote" style={{ marginBottom: 0 }}>
                    {studio.output}
                  </p>
                </div>
              </div>

              <span className="button" style={{ justifySelf: "start" }}>
                Open →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="panelCard">
        <div className="panelHeader">
          <h2>Future Enhancements</h2>
          <p className="fieldNote">
            These are not separate studios yet. They can be added later after the core workflow is stable.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          {[
            {
              title: "AI Visual Generation",
              text: "Generate charts, maps, timelines, risk heat maps, and budget visuals from student inputs.",
            },
            {
              title: "Drag-and-Drop Poster Editing",
              text: "Allow students to move visual cards and content blocks directly on the poster canvas.",
            },
            {
              title: "Professor Review Center",
              text: "Collect professor comments, student questions, review status, and action logs in one place.",
            },
            {
              title: "Export & Submission",
              text: "Export posters, presentation scripts, and readiness reports for final submission.",
            },
          ].map((item) => (
            <div key={item.title} className="panelHint">
              <strong>{item.title}</strong>
              <p className="fieldNote" style={{ marginBottom: 0, marginTop: 6 }}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
