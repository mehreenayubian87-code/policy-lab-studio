"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type {
  ProjectStudent,
  ProjectState,
} from "@/components/ProjectState/ProjectProvider";
import { saveProjectState } from "@/components/ProjectState/projectStorage";

const emptyStudent = (): ProjectStudent => ({ name: "", email: "" });

export default function TeamSetupPage() {
  const router = useRouter();

  const [projectNumber, setProjectNumber] = useState("");
  const [projectPassword, setProjectPassword] = useState("");
  const [projectTitle, setProjectTitle] = useState("");

  const [students, setStudents] = useState<ProjectStudent[]>([
    emptyStudent(),
    emptyStudent(),
  ]);

  const [teamLead, setTeamLead] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function updateStudent(index: number, key: keyof ProjectStudent, value: string) {
    setStudents((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [key]: value } : s))
    );
  }

  function addStudent() {
    setStudents((prev) => (prev.length < 5 ? [...prev, emptyStudent()] : prev));
  }

  function removeStudent(index: number) {
    setStudents((prev) => prev.filter((_, i) => i !== index));
    setTeamLead((lead) => (lead === students[index]?.name ? "" : lead));
  }

  const validStudents = students.filter((s) => s.name.trim() && s.email.trim());
  const canSubmit =
    projectNumber.trim() && projectPassword.trim().length >= 6 && validStudents.length >= 2;

  function clearForm() {
    setProjectNumber("");
    setProjectPassword("");
    setProjectTitle("");
    setStudents([emptyStudent(), emptyStudent()]);
    setTeamLead("");
    setSubmitted(false);
  }

  function handleSubmit() {
    if (!canSubmit) return;

    const normalizedStudents: ProjectStudent[] = [...students]
      .slice(0, 5)
      .map((s) => ({ name: s.name || "", email: s.email || "" }));

    while (normalizedStudents.length < 5) {
      normalizedStudents.push(emptyStudent());
    }

    const project: ProjectState = {
      setup: {
        projectId: crypto.randomUUID(),
        projectNumber: projectNumber.trim(),
        projectPassword: projectPassword,
        groupNumber: "",
        courseName: "",
        professorName: "",
        professorEmail: "",
        policyIssue: projectTitle.trim(),
        students: normalizedStudents,
        teamLead: teamLead,
      },
      objects: [],
      notes: [],
      alerts: [],
      updatedAt: new Date().toISOString(),
    };

    try {
      saveProjectState(project);
      // Clear the visible form fields after registration
      setProjectNumber("");
      setProjectPassword("");
      setProjectTitle("");
      setStudents([emptyStudent(), emptyStudent()]);
      setTeamLead("");
      setSubmitted(true);
    } catch (error) {
      console.error("Unable to save project:", error);
    }
  }

  return (
    <main className="page">
      <section className="panelCard" style={{ padding: 28 }}>
        <div className="fieldNote" style={{ fontWeight: 800 }}>POLICY LAB STUDIO</div>
        <h1 style={{ marginBottom: 4 }}>Team Setup</h1>
        <p className="hero-subtitle">Register a team by creating a project number and password.</p>

        {!submitted ? (
          <div style={{ display: "grid", gap: 16, marginTop: 18 }}>
            <label className="fieldLabel">
              <span>Project number</span>
              <input value={projectNumber} onChange={(e) => setProjectNumber(e.target.value)} placeholder="e.g. TEAM-1234" />
            </label>

            <label className="fieldLabel">
              <span>Project password</span>
              <input type="password" value={projectPassword} onChange={(e) => setProjectPassword(e.target.value)} placeholder="At least 6 characters" />
            </label>

            <label className="fieldLabel">
              <span>Project title</span>
              <input value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="Short project title" />
            </label>

            <div className="panelCard" style={{ padding: 12 }}>
              <div className="panelHeader">
                <h2 style={{ margin: 0 }}>Team Members</h2>
                <p className="fieldNote">Enter names and emails for at least two members.</p>
              </div>

              <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
                {students.map((student, index) => (
                  <div key={index} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input value={student.name} onChange={(e) => updateStudent(index, "name", e.target.value)} placeholder={`Student ${index + 1} name`} />
                    <input value={student.email} onChange={(e) => updateStudent(index, "email", e.target.value)} placeholder={`Student ${index + 1} email`} />
                    {students.length > 2 ? (
                      <button type="button" className="button secondaryButton" onClick={() => removeStudent(index)}>Remove</button>
                    ) : null}
                  </div>
                ))}

                <div>
                  <button type="button" className="button" onClick={addStudent} disabled={students.length >= 5}>Add member</button>
                </div>

                <label className="fieldLabel">
                  <span>Project lead</span>
                  <select value={teamLead} onChange={(e) => setTeamLead(e.target.value)}>
                    <option value="">Select a lead</option>
                    {students
                      .filter((s) => s.name.trim())
                      .map((s, i) => (
                        <option key={i} value={s.name}>{s.name}</option>
                      ))}
                  </select>
                </label>
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button type="button" className="button" onClick={handleSubmit} disabled={!canSubmit}>Register Team</button>
              <Link href="/" className="button secondaryButton">Cancel</Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
            <div className="fieldNote" style={{ fontWeight: 700 }}>Team registered successfully.</div>

            <div style={{ display: "flex", gap: 12 }}>
              <Link href="/project-login" className="button">Team Login</Link>
              <button type="button" className="button secondaryButton" onClick={() => clearForm()}>Register another team</button>
              <Link href="/dashboard" className="button secondaryButton">Continue to Dashboard</Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
