"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useProject,
  type ProjectState,
} from "@/components/ProjectState/ProjectProvider";
import {
  deleteProjectState,
  listProjectSummaries,
  loadProjectByNumber,
  saveProjectState,
} from "@/components/ProjectState/projectStorage";

type ProjectSummary = {
  projectNumber: string;
  groupNumber: string;
  courseName: string;
  professorName: string;
  updatedAt: string;
  alertCount?: number;
};

export default function ProfessorAdminPage() {
  const router = useRouter();
  const { replaceProject } = useProject();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectState | null>(null);

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [projects]
  );

  const handleAdminLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoggingIn(true);

    try {
      const response = await fetch("/api/professor-admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (response.ok) {
        setIsAdminLoggedIn(true);
        setIsLoadingProjects(true);
        setProjects(await listProjectSummaries());
        setIsLoadingProjects(false);
        setSelectedProject(null);
        return;
      }

      const data = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      setError(data?.error || "Invalid admin credentials.");
    } catch {
      setError("Admin login is currently unavailable.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSelectProject = async (projectNumber: string) => {
    const project = await loadProjectByNumber(projectNumber);
    if (project) {
      setSelectedProject(project);
    }
  };

  const handleDeleteProject = async () => {
    if (!selectedProject) return;

    const confirmed = window.confirm(
      `Delete team ${selectedProject.setup.projectNumber}? This will remove the team and all saved progress.`
    );

    if (!confirmed) return;

    const removed = await deleteProjectState(selectedProject.setup.projectNumber);

    if (removed) {
      setProjects(await listProjectSummaries());
      setSelectedProject(null);
    }
  };

  const handleOpenProject = async () => {
    if (!selectedProject) return;

    const clearedProject = { ...selectedProject, alerts: [] };
    await saveProjectState(clearedProject);
    replaceProject(clearedProject);
    setSelectedProject(clearedProject);
    setProjects(await listProjectSummaries());
    router.push("/dashboard");
  };

  return (
    <main className="page">
      <section className="panelCard" style={{ padding: 32, gap: 18 }}>
        <div className="fieldNote" style={{ fontWeight: 800 }}>
          PROFESSOR ADMIN
        </div>

        <h1>Admin access</h1>

        <p className="hero-subtitle">
          Sign in to view all registered projects and inspect project progress.
        </p>

        {!isAdminLoggedIn ? (
          <form onSubmit={handleAdminLogin} style={{ display: "grid", gap: 14 }}>
            <label className="fieldLabel">
              <span>Username</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter admin username"
              />
            </label>

            <label className="fieldLabel">
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter admin password"
              />
            </label>

            <button type="submit" className="button" disabled={isLoggingIn}>
              {isLoggingIn ? "Checking..." : "Login as admin"}
            </button>

            {error ? (
              <p style={{ color: "#b91c1c", margin: 0 }}>{error}</p>
            ) : null}
          </form>
        ) : (
          <div style={{ display: "grid", gap: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>Registered projects</h2>
              <button
                type="button"
                className="button secondaryButton"
                onClick={async () => {
                  await fetch("/api/professor-admin/login", {
                    method: "DELETE",
                  }).catch(() => null);
                  setIsAdminLoggedIn(false);
                  setPassword("");
                  setUsername("");
                  setSelectedProject(null);
                }}
              >
                Logout
              </button>
            </div>

            {isLoadingProjects ? (
              <p className="fieldNote">Loading registered projects...</p>
            ) : projects.length === 0 ? (
              <p className="fieldNote">No registered projects yet.</p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {sortedProjects.map((project) => {
                  const hasAlerts = Boolean(project.alertCount && project.alertCount > 0);

                  return (
                    <button
                      key={project.projectNumber}
                      type="button"
                      className="panelHint"
                      style={{ padding: 14, textAlign: "left", cursor: "pointer" }}
                      onClick={() => handleSelectProject(project.projectNumber)}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                        <div style={{ fontWeight: 700 }}>{project.projectNumber}</div>
                        {hasAlerts ? <span aria-label="alert" style={{ fontSize: 18 }}>⚠️</span> : null}
                      </div>
                      <div className="fieldNote">
                        {project.courseName || "No course name"} • {project.groupNumber || "No group"}
                      </div>
                      <div className="fieldNote">
                        Updated {new Date(project.updatedAt).toLocaleString()}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedProject ? (
              <div className="panelCard" style={{ padding: 16 }}>
                <h3 style={{ margin: "0 0 8px" }}>{selectedProject.setup.projectNumber}</h3>
                <p style={{ margin: "0 0 8px" }}>
                  <strong>Project title:</strong> {selectedProject.setup.policyIssue || "Untitled project"}
                </p>
                <p style={{ margin: "0 0 8px" }}>
                  <strong>Team lead:</strong> {selectedProject.setup.teamLead || "Not selected"}
                </p>

                <div style={{ display: "grid", gap: 6 }}>
                  <strong>Team members</strong>
                  {selectedProject.setup.students
                    .filter((student) => student.name.trim() || student.email.trim())
                    .map((student, index) => (
                      <div key={`${student.name}-${index}`} className="fieldNote">
                        {student.name || "Unnamed member"} — {student.email || "No email"}
                      </div>
                    ))}
                </div>

                <div style={{ marginTop: 12 }}>
                  <strong>Progress notes</strong>
                  {selectedProject.notes.length === 0 ? (
                    <p className="fieldNote" style={{ marginTop: 6 }}>
                      No notes yet.
                    </p>
                  ) : (
                    <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
                      {selectedProject.notes.map((note) => (
                        <div key={note.id} className="panelHint" style={{ padding: 10 }}>
                          <div className="fieldNote" style={{ marginBottom: 4 }}>
                            {note.createdBy} • {new Date(note.createdAt).toLocaleString()}
                          </div>
                          <div>{note.content}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: 12 }}>
                  <strong>Alert Details</strong>
                  {selectedProject.alerts.length === 0 ? (
                    <p className="fieldNote" style={{ marginTop: 6 }}>
                      No admin alerts yet.
                    </p>
                  ) : (
                    <div style={{ display: "grid", gap: 8, marginTop: 6 }}>
                      {selectedProject.alerts.map((alert) => (
                        <div key={alert.id} className="panelHint" style={{ padding: 10 }}>
                          <div className="fieldNote" style={{ marginBottom: 4 }}>
                            {alert.studioName} • {new Date(alert.createdAt).toLocaleString()}
                          </div>
                          <div>{alert.message}</div>
                          {alert.note ? (
                            <div style={{ marginTop: 6, fontWeight: 600 }}>{alert.note}</div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
                  <button
                    type="button"
                    className="button"
                    onClick={handleOpenProject}
                  >
                    Go to project
                  </button>

                  <button
                    type="button"
                    className="button secondaryButton"
                    onClick={() => setSelectedProject(null)}
                  >
                    Back to projects
                  </button>

                  <button
                    type="button"
                    className="button secondaryButton"
                    onClick={handleDeleteProject}
                  >
                    Delete team
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        <Link href="/" className="button secondaryButton">
          Back home
        </Link>
      </section>
    </main>
  );
}
