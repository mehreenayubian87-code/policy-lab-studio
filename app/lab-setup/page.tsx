"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export default function LabSetupPage() {
  const [labTitle, setLabTitle] = useState("");
  const [policyIssue, setPolicyIssue] = useState("");
  const [description, setDescription] = useState("");
  const [targetPopulation, setTargetPopulation] = useState("");
  const [setting, setSetting] = useState("");
  const [finalGoal, setFinalGoal] = useState("");
  const [focusArea, setFocusArea] = useState("Health policy");

  const completion = useMemo(() => {
    const fields = [
      labTitle,
      policyIssue,
      description,
      targetPopulation,
      setting,
      finalGoal,
      focusArea,
    ];

    return fields.filter((field) => field.trim()).length;
  }, [
    labTitle,
    policyIssue,
    description,
    targetPopulation,
    setting,
    finalGoal,
    focusArea,
  ]);

  const canContinue =
    labTitle.trim() &&
    policyIssue.trim() &&
    description.trim() &&
    targetPopulation.trim() &&
    setting.trim() &&
    finalGoal.trim();

  return (
    <main className="page">
      <section
        className="panelCard"
        style={{
          padding: 32,
          marginBottom: 20,
          display: "grid",
          gap: 10,
        }}
      >
        <div className="fieldNote" style={{ fontWeight: 800 }}>
          POLICY LAB STUDIO
        </div>

        <h1 style={{ marginBottom: 4 }}>Lab Setup</h1>

        <p className="hero-subtitle" style={{ marginBottom: 0 }}>
          Define the policy context, affected population, setting, and final
          output goal before entering the studio workflow.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.35fr) minmax(300px, 0.65fr)",
          gap: 18,
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: 18 }}>
          <div className="panelCard">
            <div className="panelHeader">
              <h2>Policy Lab Context</h2>
              <p className="fieldNote">
                Give your lab a clear topic and policy focus.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                columnGap: 28,
                rowGap: 18,
              }}
            >
              <label className="fieldLabel" style={{ minWidth: 0 }}>
                <span>Lab title</span>
                <input
                  value={labTitle}
                  onChange={(event) => setLabTitle(event.target.value)}
                  placeholder="e.g. Reducing outpatient waiting times"
                />
              </label>

              <label className="fieldLabel" style={{ minWidth: 0 }}>
                <span>Policy issue</span>
                <input
                  value={policyIssue}
                  onChange={(event) => setPolicyIssue(event.target.value)}
                  placeholder="e.g. Access to public hospital care"
                />
              </label>

              <label className="fieldLabel" style={{ minWidth: 0 }}>
                <span>Focus area</span>
                <select
                  value={focusArea}
                  onChange={(event) => setFocusArea(event.target.value)}
                >
                  <option>Health policy</option>
                  <option>Education policy</option>
                  <option>Social policy</option>
                  <option>Digital governance</option>
                  <option>Public sector innovation</option>
                  <option>Environment / sustainability</option>
                  <option>Transport / urban policy</option>
                  <option>Other</option>
                </select>
              </label>

              <label className="fieldLabel" style={{ minWidth: 0 }}>
                <span>Setting / context</span>
                <input
                  value={setting}
                  onChange={(event) => setSetting(event.target.value)}
                  placeholder="e.g. Qatar public hospitals"
                />
              </label>
            </div>
          </div>

          <div className="panelCard">
            <div className="panelHeader">
              <h2>Problem Scope</h2>
              <p className="fieldNote">
                Describe the issue briefly without solving it yet.
              </p>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              <label className="fieldLabel">
                <span>Brief problem description</span>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Briefly describe what is happening, who is affected, and why it matters."
                />
              </label>

              <label className="fieldLabel">
                <span>Target population</span>
                <input
                  value={targetPopulation}
                  onChange={(event) => setTargetPopulation(event.target.value)}
                  placeholder="e.g. patients seeking outpatient specialist care"
                />
              </label>

              <label className="fieldLabel">
                <span>Final output goal</span>
                <input
                  value={finalGoal}
                  onChange={(event) => setFinalGoal(event.target.value)}
                  placeholder="e.g. policy poster and implementation proposal"
                />
              </label>
            </div>
          </div>

          <div className="panelCard">
            <div className="panelHeader">
              <h2>What will happen next?</h2>
              <p className="fieldNote">
                Your lab will move through the policy studio sequence.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              {[
                ["01", "Problem", "Frame the policy problem"],
                ["02", "Process", "Map actors and systems"],
                ["03", "Solution", "Compare policy options"],
                ["04", "Implementation", "Plan delivery and evaluation"],
              ].map(([number, title, note]) => (
                <div key={title} className="panelHint">
                  <strong>{number}</strong>
                  <h3 style={{ marginTop: 8, marginBottom: 6 }}>{title}</h3>
                  <p className="fieldNote" style={{ marginBottom: 0 }}>
                    {note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside
          className="panelCard"
          style={{
            position: "sticky",
            top: 16,
            display: "grid",
            gap: 14,
          }}
        >
          <div className="panelHeader">
            <h2>Lab Summary</h2>
            <p className="fieldNote">Live overview before starting.</p>
          </div>

          <div className="panelHint">
            <strong>🧩 Lab title</strong>
            <p className="fieldNote" style={{ marginBottom: 0 }}>
              {labTitle || "Not added"}
            </p>
          </div>

          <div className="panelHint">
            <strong>🎯 Policy issue</strong>
            <p className="fieldNote" style={{ marginBottom: 0 }}>
              {policyIssue || "Not added"}
            </p>
          </div>

          <div className="panelHint">
            <strong>👥 Target population</strong>
            <p className="fieldNote" style={{ marginBottom: 0 }}>
              {targetPopulation || "Not added"}
            </p>
          </div>

          <div className="panelHint">
            <strong>📍 Setting</strong>
            <p className="fieldNote" style={{ marginBottom: 0 }}>
              {setting || "Not added"}
            </p>
          </div>

          <div className="panelHint">
            <strong>✅ Setup completion</strong>
            <p className="fieldNote" style={{ marginBottom: 0 }}>
              {completion}/7 fields completed
            </p>
          </div>

          {canContinue ? (
            <Link className="button" href="/problem-evidence">
              Start Problem Studio →
            </Link>
          ) : (
            <button type="button" className="button" disabled>
              Complete lab setup
            </button>
          )}

          <Link className="button secondaryButton" href="/team-setup">
            Back to Team Setup
          </Link>
        </aside>
      </section>
    </main>
  );
}