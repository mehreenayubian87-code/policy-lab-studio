"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

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

  async function handleSubmit() {
    if (!canSubmit) return;
    setIsSaving(true);
    setSaveError("");

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
      studioStates: {},
      notes: [],
      alerts: [],
      updatedAt: new Date().toISOString(),
    };

    try {
      const saved = await saveProjectState(project);
      if (!saved) {
        setSaveError(
          "Team registration was not saved to Supabase. Please check the database connection and try again."
        );
        return;
      }

      // Clear the visible form fields after registration
      setProjectNumber("");
      setProjectPassword("");
      setProjectTitle("");
      setStudents([emptyStudent(), emptyStudent()]);
      setTeamLead("");
      setSubmitted(true);
    } catch (error) {
      console.error("Unable to save project:", error);
      setSaveError("Unable to save this team.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className={styles.registrationPage}>
      <section className={styles.registrationCard}>
        <div className={styles.headerBlock}>
          <div className={styles.kicker}>POLICY LAB STUDIO</div>
          <h1>Team Setup</h1>
          <p>Register a team by creating a project number and password.</p>
        </div>

        {!submitted ? (
          <div className={styles.formGrid}>
            <div className={styles.projectCard}>
              <div className={styles.memberHeader}>
                <h2>Project Details</h2>
                <p>Create the team login credentials and name the policy project.</p>
              </div>

              <div className={styles.projectFields}>
                <label className={styles.fieldLabel}>
                  <span>Project number</span>
                  <input value={projectNumber} onChange={(e) => setProjectNumber(e.target.value)} placeholder="e.g. TEAM-1234" />
                </label>

                <label className={styles.fieldLabel}>
                  <span>Project password</span>
                  <input type="password" value={projectPassword} onChange={(e) => setProjectPassword(e.target.value)} placeholder="At least 6 characters" />
                </label>

                <label className={`${styles.fieldLabel} ${styles.titleField}`}>
                  <span>Project title</span>
                  <input value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} placeholder="Short project title or policy issue sentence" />
                </label>
              </div>
            </div>

            <div className={styles.memberCard}>
              <div className={styles.memberHeader}>
                <h2>Team Members</h2>
                <p>Enter names and emails for at least two members.</p>
              </div>

              <div className={styles.memberList}>
                {students.map((student, index) => (
                  <div key={index} className={styles.memberRow}>
                    <input value={student.name} onChange={(e) => updateStudent(index, "name", e.target.value)} placeholder={`Student ${index + 1} name`} />
                    <input value={student.email} onChange={(e) => updateStudent(index, "email", e.target.value)} placeholder={`Student ${index + 1} email`} />
                    {students.length > 2 ? (
                      <button type="button" className={styles.secondaryAction} onClick={() => removeStudent(index)}>Remove</button>
                    ) : null}
                  </div>
                ))}

                <div>
                  <button type="button" className={styles.primaryAction} onClick={addStudent} disabled={students.length >= 5}>Add member</button>
                </div>

                <label className={styles.fieldLabel}>
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

            <div className={styles.finalActions}>
              <button type="button" className={styles.primaryAction} onClick={handleSubmit} disabled={!canSubmit || isSaving}>{isSaving ? "Saving..." : "Register Team"}</button>
              <Link href="/" className={styles.primaryAction}>Cancel</Link>
            </div>

            {saveError ? (
              <p className={styles.errorText}>{saveError}</p>
            ) : null}
          </div>
        ) : (
          <div className={styles.successPanel}>
            <div className={styles.successText}>Team registered successfully.</div>

            <div className={styles.actions}>
              <Link href="/project-login" className={styles.primaryAction}>Team Login</Link>
              <button type="button" className={styles.secondaryAction} onClick={() => clearForm()}>Register another team</button>
              <Link href="/" className={styles.secondaryAction}>Go to home</Link>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
