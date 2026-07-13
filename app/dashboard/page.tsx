"use client";

import Link from "next/link";

type Studio = {
  number: string;
  title: string;
  href: string;
  phase: string;
  description: string;
  output: string;
};

const studios: Studio[] = [
  {
    number: "01",
    title: "Problem & Evidence Studio",
    href: "/problem-evidence",
    phase: "Understand",
    description:
      "Explore the policy problem, organise evidence, identify affected groups, and frame the core question.",
    output:
      "Problem frame, evidence notes, affected population, assumptions, and poster-ready problem content.",
  },
  {
    number: "02",
    title: "Process Studio",
    href: "/stakeholder-systems",
    phase: "Map",
    description:
      "Map stakeholders, participation, power dynamics, systems relationships, gaps, and opportunities.",
    output:
      "Stakeholder analysis, participation layers, process map, policy canvas, and opportunity areas.",
  },
  {
    number: "03",
    title: "Solution Studio",
    href: "/solution",
    phase: "Design",
    description:
      "Develop policy options, compare alternatives, build a theory of change, and identify risks and indicators.",
    output:
      "Solution options, theory of change, beneficiaries, delivery model, risks, indicators, and rollout strategy.",
  },
  {
    number: "04",
    title: "Implementation Studio",
    href: "/implementation",
    phase: "Plan",
    description:
      "Plan governance, ownership, activities, resources, timeline, monitoring, and scale-up.",
    output:
      "Implementation plan, activity table, budget, timeline, risk plan, and monitoring indicators.",
  },
  {
    number: "05",
    title: "Poster Studio",
    href: "/poster",
    phase: "Assemble",
    description:
      "Bring together outputs from the previous studios and organise the final policy poster.",
    output:
      "Poster canvas, structured content, visuals, review notes, and final poster.",
  },
  {
    number: "06",
    title: "Presentation Studio",
    href: "/presentation",
    phase: "Present",
    description:
      "Prepare the final presentation, pitch script, speaker flow, and likely judges’ questions.",
    output:
      "Presentation flow, pitch script, judges’ questions, and final readiness checklist.",
  },
  {
    number: "07",
    title: "Policy Portfolio",
    href: "/portfolio",
    phase: "Explore",
    description:
      "Browse previous student posters organised by cohort as a reference archive.",
    output:
      "Previous cohort posters organised by program and year.",
  },
];

export default function Dashboard() {
  return (
    <main className="page">
      <section
        className="panelCard"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.3fr) minmax(260px, 0.7fr)",
          gap: 24,
          alignItems: "center",
          padding: 30,
          marginBottom: 22,
        }}
      >
        <div>
          <div
            className="fieldNote"
            style={{
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Policy Lab Studio
          </div>

          <h1 style={{ marginBottom: 8 }}>Studio Dashboard</h1>

          <p className="hero-subtitle" style={{ marginBottom: 0 }}>
            Access each studio and move through the Policy Lab journey in
            sequence.
          </p>
        </div>

        <div
          className="panelHint"
          style={{
            display: "grid",
            gap: 12,
          }}
        >
          <strong>Begin the workflow</strong>

          <p className="fieldNote" style={{ margin: 0 }}>
            Start with the Problem & Evidence Studio.
          </p>

          <Link href="/problem-evidence" className="button">
            Start Studio 1
          </Link>
        </div>
      </section>

      <section
        className="panelCard"
        style={{
          marginBottom: 22,
          overflow: "hidden",
        }}
      >
        <div className="panelHeader">
          <h2>Policy Lab Pathway</h2>

          <p className="fieldNote">
            Policy Lab studios with a brief description of each stage.
          </p>
        </div>

        <div
          style={{
            overflowX: "auto",
            paddingBottom: 10,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              gap: 12,
              minWidth: "max-content",
            }}
          >
            {studios.map((studio, index) => (
              <div
                key={studio.number}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <Link
                  href={studio.href}
                  className="panelHint"
                  style={{
                    width: 290,
                    minHeight: 350,
                    padding: 20,
                    textDecoration: "none",
                    color: "inherit",
                    border: "1px solid rgba(15, 47, 102, 0.12)",
                    display: "grid",
                    gridTemplateRows: "auto auto 1fr auto auto",
                    gap: 14,
                    transition:
                      "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 10,
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 16,
                        display: "grid",
                        placeItems: "center",
                        background: "rgba(15, 47, 102, 0.08)",
                        color: "#0f2f66",
                        fontWeight: 900,
                      }}
                    >
                      {studio.number}
                    </div>

                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        background: "#ffffff",
                        color: "#0f2f66",
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      {studio.phase}
                    </span>
                  </div>

                  <h3
                    style={{
                      margin: 0,
                      color: "#0f2f66",
                    }}
                  >
                    {studio.title}
                  </h3>

                  <p
                    className="fieldNote"
                    style={{
                      margin: 0,
                      lineHeight: 1.55,
                    }}
                  >
                    {studio.description}
                  </p>

                  <div
                    style={{
                      paddingTop: 14,
                      borderTop: "1px solid rgba(15, 47, 102, 0.1)",
                    }}
                  >
                    <strong
                      style={{
                        display: "block",
                        marginBottom: 6,
                        color: "#0f2f66",
                      }}
                    >
                      Expected output
                    </strong>

                    <p
                      className="fieldNote"
                      style={{
                        margin: 0,
                        lineHeight: 1.5,
                      }}
                    >
                      {studio.output}
                    </p>
                  </div>

                  <span
                    className="button"
                    style={{
                      justifySelf: "start",
                    }}
                  >
                    Open Studio →
                  </span>
                </Link>

                {index < studios.length - 1 ? (
                  <div
                    aria-hidden="true"
                    style={{
                      minWidth: 34,
                      height: 34,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      background: "#0f2f66",
                      color: "#ffffff",
                      fontSize: 20,
                      fontWeight: 900,
                      boxShadow: "0 8px 18px rgba(15, 47, 102, 0.18)",
                    }}
                  >
                    →
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        className="panelCard"
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <Link href="/" className="button secondaryButton">
          Back to Home
        </Link>

        <div
          className="actionRow"
          style={{
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <Link href="/team-setup" className="button secondaryButton">
            Back to Team Setup
          </Link>

          <Link href="/resource-hub" className="button secondaryButton">
            Open Resource Hub
          </Link>
        </div>
      </section>
    </main>
  );
}