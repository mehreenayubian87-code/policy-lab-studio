"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

const roleOptions = [
  "Team Lead",
  "Evidence Lead",
  "Stakeholder Lead",
  "Systems Lead",
  "Policy Lead",
  "Presenter",
  "Research Lead",
  "Other",
];

type Member = {
  name: string;
  role: string;
};

export default function TeamSetupPage() {
  const [groupNumber, setGroupNumber] = useState("1");
  const [groupName, setGroupName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [members, setMembers] = useState<Member[]>([
    { name: "", role: "Team Lead" },
    { name: "", role: "Evidence Lead" },
  ]);
  const [agreement, setAgreement] = useState({
    participate: false,
    evidence: false,
    ai: false,
  });

  const filledMembers = useMemo(
    () => members.filter((member) => member.name.trim()),
    [members]
  );

  const teamLead =
    members.find((member) => member.role === "Team Lead" && member.name.trim())
      ?.name || "Not assigned";

  const canContinue =
    groupNumber.trim() &&
    courseName.trim() &&
    instructorName.trim() &&
    filledMembers.length >= 2 &&
    agreement.participate &&
    agreement.evidence &&
    agreement.ai;

  const updateMember = (
    index: number,
    key: keyof Member,
    value: string
  ) => {
    setMembers((prev) =>
      prev.map((member, i) =>
        i === index ? { ...member, [key]: value } : member
      )
    );
  };

  const addMember = () => {
    if (members.length >= 4) return;
    setMembers((prev) => [...prev, { name: "", role: "Other" }]);
  };

  const removeMember = (index: number) => {
    if (members.length <= 2) return;
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

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

  <h1 style={{ marginBottom: 4 }}>Team Setup</h1>

  <p className="hero-subtitle" style={{ marginBottom: 0 }}>
    Create a group profile for 2–4 students before starting the studio workflow.
  </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.3fr) minmax(280px, 0.7fr)",
          gap: 18,
          alignItems: "start",
        }}
      >
        <div style={{ display: "grid", gap: 18 }}>
          <div className="panelCard">
            <div className="panelHeader">
              <h2>Lab Information</h2>
              <p className="fieldNote">Basic details for this group project.</p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <label className="fieldLabel">
                <span>Group number</span>
                <input
                  value={groupNumber}
                  onChange={(event) => setGroupNumber(event.target.value)}
                  placeholder="e.g. 1"
                />
              </label>

              <label className="fieldLabel">
                <span>Group name optional</span>
                <input
                  value={groupName}
                  onChange={(event) => setGroupName(event.target.value)}
                  placeholder="e.g. Policy Innovators"
                />
              </label>

              <label className="fieldLabel">
                <span>Course / session name</span>
                <input
                  value={courseName}
                  onChange={(event) => setCourseName(event.target.value)}
                  placeholder="e.g. MGHP Policy Lab"
                />
              </label>

              <label className="fieldLabel">
                <span>Instructor / professor name</span>
                <input
                  value={instructorName}
                  onChange={(event) => setInstructorName(event.target.value)}
                  placeholder="e.g. Dr. ..."
                />
              </label>
            </div>
          </div>

          <div className="panelCard">
            <div className="panelHeader">
              <h2>Team Members</h2>
              <p className="fieldNote">Enter 2–4 members and assign roles.</p>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {members.map((member, index) => (
                <div
                  key={index}
                  className="panelHint"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 1.2fr) minmax(160px, 0.8fr) auto",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <input
                    value={member.name}
                    onChange={(event) =>
                      updateMember(index, "name", event.target.value)
                    }
                    placeholder={`Student ${index + 1} name`}
                  />

                  <select
                    value={member.role}
                    onChange={(event) =>
                      updateMember(index, "role", event.target.value)
                    }
                  >
                    {roleOptions.map((role) => (
                      <option key={role}>{role}</option>
                    ))}
                  </select>

                  <button
                    type="button"
                    className="button secondaryButton"
                    onClick={() => removeMember(index)}
                    disabled={members.length <= 2}
                    title="Remove member"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <div className="actionRow" style={{ marginTop: 14 }}>
              <button
                type="button"
                className="button secondaryButton"
                onClick={addMember}
                disabled={members.length >= 4}
              >
                + Add Member
              </button>

              <span className="fieldNote">
                {members.length}/4 member slots used
              </span>
            </div>
          </div>

          <div className="panelCard">
            <div className="panelHeader">
              <h2>Team Agreement</h2>
              <p className="fieldNote">
                A short commitment before entering the studio.
              </p>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              <label className="panelHint">
                <input
                  type="checkbox"
                  checked={agreement.participate}
                  onChange={() =>
                    setAgreement((prev) => ({
                      ...prev,
                      participate: !prev.participate,
                    }))
                  }
                  style={{ width: "auto", marginRight: 8 }}
                />
                All team members agree to participate.
              </label>

              <label className="panelHint">
                <input
                  type="checkbox"
                  checked={agreement.evidence}
                  onChange={() =>
                    setAgreement((prev) => ({
                      ...prev,
                      evidence: !prev.evidence,
                    }))
                  }
                  style={{ width: "auto", marginRight: 8 }}
                />
                We will make decisions using evidence and policy reasoning.
              </label>

              <label className="panelHint">
                <input
                  type="checkbox"
                  checked={agreement.ai}
                  onChange={() =>
                    setAgreement((prev) => ({
                      ...prev,
                      ai: !prev.ai,
                    }))
                  }
                  style={{ width: "auto", marginRight: 8 }}
                />
                We will review AI suggestions critically and confirm with the
                professor.
              </label>
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
            <h2>Team Summary</h2>
            <p className="fieldNote">Live overview of your group.</p>
          </div>

          <div className="panelHint">
            <strong>👥 Members</strong>
            <p className="fieldNote" style={{ marginBottom: 0 }}>
              {filledMembers.length} of 4 added
            </p>
          </div>

          <div className="panelHint">
            <strong>⭐ Team Lead</strong>
            <p className="fieldNote" style={{ marginBottom: 0 }}>
              {teamLead}
            </p>
          </div>

          <div className="panelHint">
            <strong>📚 Course</strong>
            <p className="fieldNote" style={{ marginBottom: 0 }}>
              {courseName || "Not added"}
            </p>
          </div>

          <div className="panelHint">
            <strong>🧩 Starting Studio</strong>
            <p className="fieldNote" style={{ marginBottom: 0 }}>
              Problem & Evidence Studio
            </p>
          </div>

          {canContinue ? (
            <Link className="button" href="/lab-setup">
              Continue to Lab Setup →
            </Link>
          ) : (
            <button type="button" className="button" disabled>
              Complete setup to continue
            </button>
          )}

          <Link className="button secondaryButton" href="/dashboard">
            Back to Dashboard
          </Link>
        </aside>
      </section>
    </main>
  );
}