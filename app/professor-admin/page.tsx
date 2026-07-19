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
import styles from "./page.module.css";

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
      setSelectedProject({
        ...project,
        setup: {
          ...project.setup,
          projectNumber,
        },
      });
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
    <main className={styles.adminPage}>
      <section className={styles.adminCard}>
        <div className={styles.headerBlock}>
          <div className={styles.kicker}>PROFESSOR ADMIN</div>

          <h1>Admin access</h1>

          <p>
            Sign in to view all registered projects and inspect project progress.
          </p>
        </div>

        {!isAdminLoggedIn ? (
          <form onSubmit={handleAdminLogin} className={styles.formGrid}>
            <label className={styles.fieldLabel}>
              <span>Username</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter admin username"
              />
            </label>

            <label className={styles.fieldLabel}>
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter admin password"
              />
            </label>

            <button type="submit" className={styles.primaryAction} disabled={isLoggingIn}>
              {isLoggingIn ? "Checking..." : "Login as admin"}
            </button>

            {error ? (
              <p className={styles.errorText}>{error}</p>
            ) : null}
          </form>
        ) : (
          <div className={styles.adminContent}>
            <div className={styles.adminTopBar}>
              <h2>Registered projects</h2>
              <button
                type="button"
                className={styles.secondaryAction}
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
              <p className={styles.mutedText}>Loading registered projects...</p>
            ) : projects.length === 0 ? (
              <p className={styles.mutedText}>No registered projects yet.</p>
            ) : (
              <div className={styles.projectList}>
                {sortedProjects.map((project) => {
                  const hasAlerts = Boolean(project.alertCount && project.alertCount > 0);

                  return (
                    <button
                      key={project.projectNumber}
                      type="button"
                      className={styles.projectButton}
                      onClick={() => handleSelectProject(project.projectNumber)}
                    >
                      <div className={styles.projectButtonTop}>
                        <div>{project.projectNumber}</div>
                        {hasAlerts ? <span aria-label="alert">!</span> : null}
                      </div>
                      <div className={styles.projectMeta}>
                        {project.courseName || "No course name"} • {project.groupNumber || "No group"}
                      </div>
                      <div className={styles.projectMeta}>
                        Updated {new Date(project.updatedAt).toLocaleString()}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedProject ? (
              <div className={styles.detailCard}>
                <h3>{selectedProject.setup.projectNumber}</h3>
                <p>
                  <strong>Project title:</strong> {selectedProject.setup.policyIssue || "Untitled project"}
                </p>
                <p>
                  <strong>Team lead:</strong> {selectedProject.setup.teamLead || "Not selected"}
                </p>

                <div className={styles.detailSection}>
                  <strong>Team members</strong>
                  {selectedProject.setup.students
                    .filter((student) => student.name.trim() || student.email.trim())
                    .map((student, index) => (
                      <div key={`${student.name}-${index}`} className={styles.mutedText}>
                        {student.name || "Unnamed member"} - {student.email || "No email"}
                      </div>
                    ))}
                </div>

                <div className={styles.detailSection}>
                  <strong>Progress notes</strong>
                  {selectedProject.notes.length === 0 ? (
                    <p className={styles.mutedText}>
                      No notes yet.
                    </p>
                  ) : (
                    <div className={styles.noteList}>
                      {selectedProject.notes.map((note) => (
                        <div key={note.id} className={styles.noteCard}>
                          <div className={styles.noteMeta}>
                            {note.createdBy} - {new Date(note.createdAt).toLocaleString()}
                          </div>
                          <div>{note.content}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.detailSection}>
                  <strong>Alert Details</strong>
                  {selectedProject.alerts.length === 0 ? (
                    <p className={styles.mutedText}>
                      No admin alerts yet.
                    </p>
                  ) : (
                    <div className={styles.noteList}>
                      {selectedProject.alerts.map((alert) => (
                        <div key={alert.id} className={styles.noteCard}>
                          <div className={styles.noteMeta}>
                            {alert.studioName} - {new Date(alert.createdAt).toLocaleString()}
                          </div>
                          <div>{alert.message}</div>
                          {alert.note ? (
                            <div className={styles.noteStrong}>{alert.note}</div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.primaryAction}
                    onClick={handleOpenProject}
                  >
                    Go to project
                  </button>

                  <button
                    type="button"
                    className={styles.secondaryAction}
                    onClick={() => setSelectedProject(null)}
                  >
                    Back to projects
                  </button>

                  <button
                    type="button"
                    className={styles.secondaryAction}
                    onClick={handleDeleteProject}
                  >
                    Delete team
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}

        <Link href="/" className={styles.secondaryAction}>
          Back home
        </Link>
      </section>
    </main>
  );
}
