"use client";

import Link from "next/link";

export default function Orientation() {
  return (
    <main className="page">
      <section className="hero" style={{ minHeight: "auto", padding: 36 }}>
        <div className="hero-content">
          <h1>Policy Lab Studio</h1>
          <p className="hero-subtitle">What is Policy Lab Studio?</p>

          <div style={{ maxWidth: 680 }}>
            <p>
              Policy Lab Studio is a guided policy learning workspace. It is
              not a game or simulation — it helps students move through a
              structured set of studios from problem exploration to a final
              poster and pitch.
            </p>

            <p>
              The AI Facilitator supports thinking and offers feedback but does
              not write your answers. Students should confirm key decisions
              with their professor or instructor before proceeding.
            </p>

            <p>
              A Resource Hub will later contain course materials, readings,
              templates, examples, and tools.
            </p>
          </div>

          <div className="hero-actions" style={{ marginTop: 24 }}>
            <Link className="button button-primary" href="/team-setup">
              Continue to Team Setup
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
