import Link from "next/link";

export default function HomePage() {
  return (
    <main
      className="page"
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateRows: "1fr auto",
        background: "#f7f4ec",
      }}
    >
      <section
        style={{
          display: "grid",
          placeItems: "center",
          padding: "48px 24px",
        }}
      >
        <div
          className="panelCard"
          style={{
            width: "min(900px, 100%)",
            padding: "56px 40px",
            textAlign: "center",
            display: "grid",
            gap: 18,
          }}
        >
          <div
            className="fieldNote"
            style={{
              fontWeight: 900,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            POLICY LAB STUDIO
          </div>

          <h1
            style={{
              margin: 0,
              color: "#0f2f66",
              fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
              lineHeight: 1.05,
            }}
          >
            Policy Lab Studio
          </h1>

          <p
            className="hero-subtitle"
            style={{
              margin: "0 auto",
              maxWidth: 700,
            }}
          >
            A guided workspace for developing evidence-informed policy solutions.
          </p>

          <div
            className="actionRow"
            style={{
              justifyContent: "center",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 10,
            }}
          >
            <Link href="/overview" className="button">
              Start Policy Lab
            </Link>

            <Link href="/dashboard" className="button secondaryButton">
              Continue to Dashboard
            </Link>
          </div>
        </div>
      </section>

      <footer
        style={{
          padding: "22px 24px 28px",
          textAlign: "center",
          color: "#475569",
          lineHeight: 1.6,
        }}
      >
        <div>
          Developed by <strong>Mehreen Afsar Jadoon (Student MGHP)</strong>
        </div>
        <div>
          Under the supervision of <strong>Dr. Evren Tok</strong>
        </div>
      </footer>
    </main>
  );
}
