import Link from "next/link";

const journey = [
  {
    step: "01",
    title: "Problem & Evidence",
    description:
      "Define the policy problem, organise evidence, identify affected groups, and frame the core question.",
  },
  {
    step: "02",
    title: "Process",
    description:
      "Map stakeholders, participation, power, systems relationships, and opportunities.",
  },
  {
    step: "03",
    title: "Solution",
    description:
      "Develop and compare policy options, theory of change, risks, and indicators.",
  },
  {
    step: "04",
    title: "Implementation",
    description:
      "Plan governance, activities, resources, timeline, monitoring, and scale-up.",
  },
  {
    step: "05",
    title: "Poster",
    description:
      "Bring together the final policy content and visuals.",
  },
  {
    step: "06",
    title: "Presentation",
    description:
      "Prepare the final pitch, script, and judges' questions.",
  },
  {
    step: "07",
    title: "Policy Portfolio",
    description:
      "Explore previous student posters as a reference archive.",
  },
];

const principles = [
  "Students remain responsible for their final work.",
  "Evidence should support major decisions.",
  "Professor feedback should guide revisions.",
  "Each studio contributes to the final poster and presentation.",
];

export default function PolicyLabOverview() {
  return (
    <main className="page">
      <section
        className="panelCard"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 0.7fr)",
          gap: 24,
          alignItems: "center",
          padding: 28,
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

          <h1 style={{ marginBottom: 8 }}>Policy Lab Overview</h1>

          <p className="hero-subtitle" style={{ marginBottom: 0 }}>
            A structured journey from policy problem to final poster and presentation.
          </p>
        </div>

        <div className="panelHint" style={{ display: "grid", gap: 12 }}>
          <strong>Next step</strong>
          <p className="fieldNote" style={{ margin: 0 }}>
            Complete the overview, then set up your team.
          </p>

          <div
            className="actionRow"
            style={{
              justifyContent: "flex-start",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <Link href="/" className="button secondaryButton">
              Back to Home
            </Link>

            <Link href="/team-setup" className="button">
              Continue to Team Setup
            </Link>
          </div>
        </div>
      </section>

      <section className="panelCard" style={{ marginBottom: 22 }}>
        <div className="panelHeader">
          <h2>Policy Lab Journey</h2>
          <p className="fieldNote">Complete the studios in sequence.</p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          {journey.map((item) => (
            <div key={item.step} className="panelHint" style={{ display: "grid", gap: 8 }}>
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 16,
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 900,
                  background: "rgba(15, 47, 102, 0.08)",
                  color: "#0f2f66",
                }}
              >
                {item.step}
              </div>

              <h3 style={{ marginBottom: 4 }}>{item.title}</h3>
              <p className="fieldNote" style={{ marginBottom: 0 }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 18,
          marginBottom: 22,
        }}
      >
        <div className="panelCard">
          <div className="panelHeader">
            <h2>Review</h2>
          </div>

          <p style={{ marginBottom: 0 }}>
            Review provides structured guidance, professor feedback, checklists,
            and relevant resources throughout the studios.
          </p>
        </div>

        <div className="panelCard">
          <div className="panelHeader">
            <h2>Studio Principles</h2>
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {principles.map((principle) => (
              <div key={principle} className="panelHint">
                {principle}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panelCard">
        <div
          className="actionRow"
          style={{
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <Link href="/" className="button secondaryButton">
            Back to Home
          </Link>

          <Link href="/team-setup" className="button">
            Continue to Team Setup
          </Link>
        </div>
      </section>
    </main>
  );
}
