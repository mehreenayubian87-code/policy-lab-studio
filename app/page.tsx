import Link from "next/link";

const studios = [
  {
    id: "01",
    title: "Problem Studio",
    text: "Explore. Understand. Define.",
    icon: "🔍",
  },
  {
    id: "02",
    title: "Process Studio",
    text: "Analyse. Map. Reflect.",
    icon: "🧭",
  },
  {
    id: "03",
    title: "Solution Studio",
    text: "Generate. Refine. Test.",
    icon: "💡",
  },
  {
    id: "04",
    title: "Implementation Studio",
    text: "Plan. Deliver. Sustain.",
    icon: "🛠️",
  },
  {
    id: "05",
    title: "Poster Studio",
    text: "Communicate. Present. Share.",
    icon: "📣",
  },
];

export default function Home() {
  return (
    <main className="page">
      <section className="hero">
        <div className="heroText">
          <p className="kicker">POLICY LAB</p>

          <h1>Policy Lab Studio</h1>

          <p className="subtitle">
            A guided learning environment for exploring problems, analysing
            systems, designing solutions, planning implementation, and
            communicating policy ideas.
          </p>

          <div className="supervisorCard">
            <img
              src="/images/evren.jpg.jpeg"
              alt="Dr. Evren Tok"
              className="supervisorPhoto"
            />

            <div>
              <p className="supervisorLabel">Academic Supervision</p>

              <h2>Dr. Evren Tok</h2>

              <p className="supervisorTitle">
                College of Public Policy, HBKU
              </p>
            </div>
          </div>

          <div className="actionRow" style={{ justifyContent: "flex-start" }}>
            <Link className="button button-primary" href="/overview">
              Start Policy Lab
            </Link>

            <Link className="button secondaryButton" href="/dashboard">
              Go to Dashboard
            </Link>
          </div>
        </div>

        <div className="heroVisual">
          <img
            src="/images/scene.jpg"
            alt="Students collaborating on policy lab"
            className="heroImage"
          />
        </div>
      </section>

      <section className="journey" id="journey">
        <p className="kicker">POLICY LAB JOURNEY</p>

        <div className="journeyGrid">
          {studios.map((studio) => (
            <article className="studioCard" key={studio.id}>
              <div className="icon">{studio.icon}</div>

              <span>{studio.id}</span>

              <h3>{studio.title}</h3>

              <p>{studio.text}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="footer">
        Designed by Dr. Mehreen Jadoon under the supervision of Dr. Evren Tok,
        College of Public Policy, HBKU.
      </footer>
    </main>
  );
}