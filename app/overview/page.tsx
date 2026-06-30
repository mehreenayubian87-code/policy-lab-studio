import Link from "next/link";

const journey = [
  { step: "01", title: "Problem & Evidence", description: "Understand the policy problem, evidence, assumptions, affected groups, and How Might We question." },
  { step: "02", title: "Process", description: "Map stakeholders, participation, process approach, policy canvas, systems relationships, and opportunities." },
  { step: "03", title: "Solution", description: "Generate interventions, compare options, build hypothesis of change, theory of change, risks, metrics, and rollout logic." },
  { step: "04", title: "Implementation", description: "Plan governance, ownership, resources, timeline, monitoring, sustainability, and scale-up." },
  { step: "05", title: "Poster & Pitch", description: "Convert studio outputs into a final policy poster, presentation script, and judge Q&A preparation." },
];

const principles = [
  "Students remain the authors of their work.",
  "AI supports reflection and feedback only; it does not replace student thinking.",
  "Evidence, course materials, and professor feedback should guide every major decision.",
  "Each studio should prepare content that can later feed into the final poster and pitch.",
];

export default function PolicyLabOverview() {
  return (
    <main className="page">
      <section className="panelCard" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 0.7fr)", gap: 24, alignItems: "center", padding: 28, marginBottom: 22 }}>
        <div>
          <div className="fieldNote" style={{ fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
            Policy Lab Studio
          </div>
          <h1 style={{ marginBottom: 8 }}>Policy Lab Overview</h1>
          <p className="hero-subtitle" style={{ marginBottom: 10 }}>
            A guided learning journey from policy problem to final poster and pitch.
          </p>
          <p style={{ maxWidth: 820, marginBottom: 0 }}>
            Policy Lab Studio helps student groups move through a structured policy design process. It supports
            problem exploration, process mapping, solution design, implementation planning, poster development,
            and presentation preparation.
          </p>
        </div>

        <div className="panelHint" style={{ display: "grid", gap: 12 }}>
          <strong>Start here</strong>
          <p className="fieldNote" style={{ margin: 0 }}>
            Read this overview, open the Resource Hub, complete team setup, then enter the dashboard.
          </p>
          <div className="actionRow" style={{ justifyContent: "flex-start", gap: 10, flexWrap: "wrap" }}>
            <Link href="/resource-hub" className="button">Open Resource Hub</Link>
            <Link href="/team-setup" className="button secondaryButton">Team Setup</Link>
          </div>
        </div>
      </section>

      <section className="panelCard" style={{ marginBottom: 22 }}>
        <div className="panelHeader">
          <h2>What students will do</h2>
          <p className="fieldNote">Each studio builds one part of the final policy poster and presentation.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
          {journey.map((item) => (
            <div key={item.step} className="panelHint" style={{ display: "grid", gap: 8 }}>
              <div style={{ width: 46, height: 46, borderRadius: 16, display: "grid", placeItems: "center", fontWeight: 800, background: "rgba(15, 47, 102, 0.08)", color: "#0f2f66" }}>
                {item.step}
              </div>
              <h3 style={{ marginBottom: 4 }}>{item.title}</h3>
              <p className="fieldNote" style={{ marginBottom: 0 }}>{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18, marginBottom: 22 }}>
        <div className="panelCard">
          <div className="panelHeader"><h2>AI Facilitator</h2></div>
          <p>
            The AI Facilitator gives reflection support, identifies gaps, asks questions, and suggests what students
            may need to confirm with their professor.
          </p>
          <div className="panelHint">
            <strong>Important:</strong>
            <p className="fieldNote" style={{ marginBottom: 0 }}>
              AI should not write final answers for students. It should guide thinking and support learning.
            </p>
          </div>
        </div>

        <div className="panelCard">
          <div className="panelHeader"><h2>Professor Review</h2></div>
          <p>
            Professor review is part of the learning process. Students can prepare questions and track feedback across
            studios. Later, a Review Center will bring all review requests, comments, responses, and status updates into
            one place.
          </p>
          <div className="panelHint">
            <strong>Review status options:</strong>
            <p className="fieldNote" style={{ marginBottom: 0 }}>
              Draft → Submitted → Under Review → Revision Requested → Approved
            </p>
          </div>
        </div>
      </section>

      <section className="panelCard">
        <div className="panelHeader">
          <h2>Studio principles</h2>
          <p className="fieldNote">These principles should guide student work throughout the lab.</p>
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {principles.map((principle) => (
            <div key={principle} className="panelHint">{principle}</div>
          ))}
        </div>

        <div className="actionRow" style={{ marginTop: 20, justifyContent: "flex-start", gap: 10, flexWrap: "wrap" }}>
          <Link href="/resource-hub" className="button">Continue to Resource Hub</Link>
          <Link href="/dashboard" className="button secondaryButton">Skip to Dashboard</Link>
        </div>
      </section>
    </main>
  );
}
