import Link from "next/link";

const resourceSections = [
  { title: "Course Slides", description: "Upload lecture slides and session materials here later.", items: ["Problem framing slides", "Policy process slides", "Policy design slides", "Implementation slides"] },
  { title: "Required Readings", description: "Add core readings assigned by the course team.", items: ["Policy design readings", "Systems thinking readings", "Theory of Change readings", "Implementation readings"] },
  { title: "Frameworks", description: "Students can use these frameworks while working through studios.", items: ["Problem framing", "Stakeholder mapping", "Power-interest matrix", "Policy canvas", "Theory of Change"] },
  { title: "Templates", description: "Reusable templates for studio activities and final outputs.", items: ["Evidence source template", "Policy canvas template", "Theory of Change template", "Risk table", "Poster outline"] },
  { title: "Examples", description: "Examples should be added only from approved course material or professor-approved work.", items: ["Previous posters", "Sample policy briefs", "Example stakeholder maps", "Example solution logic"] },
  { title: "Poster & Pitch Resources", description: "Resources for final communication and presentation.", items: ["Poster checklist", "Pitch structure", "Judge Q&A guide", "Visual communication guide"] },
];

const studioLinks = [
  { title: "Problem & Evidence Studio", href: "/problem-evidence", resources: "Problem framing, evidence assessment, personas, HMW." },
  { title: "Process Studio", href: "/stakeholder-systems", resources: "Stakeholder mapping, participation structure, policy canvas, systems mapping." },
  { title: "Solution Studio", href: "/solution", resources: "Solution options, hypothesis of change, theory of change, metrics, rollout." },
];

export default function ResourceHub() {
  return (
    <main className="page">
      <section className="panelCard" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 0.7fr)", gap: 24, alignItems: "center", padding: 28, marginBottom: 22 }}>
        <div>
          <div className="fieldNote" style={{ fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
            Policy Lab Studio
          </div>
          <h1 style={{ marginBottom: 8 }}>Resource Hub</h1>
          <p className="hero-subtitle" style={{ marginBottom: 10 }}>
            Central place for course materials, templates, frameworks, and poster resources.
          </p>
          <p style={{ maxWidth: 820, marginBottom: 0 }}>
            This page is reserved for authentic course material. Do not add guessed references. When the course slides,
            readings, templates, or examples are ready, they can be added here and linked to the relevant studios.
          </p>
        </div>

        <div className="panelHint" style={{ display: "grid", gap: 12 }}>
          <strong>Current status</strong>
          <p className="fieldNote" style={{ margin: 0 }}>
            Resource placeholders are ready. Actual materials should be added later from approved course content only.
          </p>
          <div className="actionRow" style={{ justifyContent: "flex-start", gap: 10, flexWrap: "wrap" }}>
            <Link href="/dashboard" className="button">Go to Dashboard</Link>
            <Link href="/overview" className="button secondaryButton">Back to Overview</Link>
          </div>
        </div>
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18, marginBottom: 22 }}>
        {resourceSections.map((section) => (
          <div key={section.title} className="panelCard" style={{ display: "grid", gap: 12 }}>
            <div className="panelHeader">
              <h2>{section.title}</h2>
              <p className="fieldNote">{section.description}</p>
            </div>
            <div style={{ display: "grid", gap: 8 }}>
              {section.items.map((item) => (
                <div key={item} className="panelHint">{item}</div>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="panelCard">
        <div className="panelHeader">
          <h2>Studio-specific resource suggestions</h2>
          <p className="fieldNote">
            These are placeholders for links that will later connect each studio to relevant course materials.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {studioLinks.map((studio) => (
            <Link key={studio.title} href={studio.href} className="panelHint" style={{ textDecoration: "none", color: "inherit", display: "grid", gap: 8 }}>
              <strong>{studio.title}</strong>
              <p className="fieldNote" style={{ marginBottom: 0 }}>{studio.resources}</p>
              <span className="fieldNote">Open studio →</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
