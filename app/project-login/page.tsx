"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "@/components/ProjectState/ProjectProvider";
import { loadProjectByNumberAndPassword } from "@/components/ProjectState/projectStorage";

export default function ProjectLoginPage() {
  const [projectNumber, setProjectNumber] = useState("");
  const [projectPassword, setProjectPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { replaceProject } = useProject();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!projectNumber.trim() || !projectPassword.trim()) {
      setError("Enter both project number and password.");
      return;
    }

    setIsLoading(true);

    const storedProject = await loadProjectByNumberAndPassword(
      projectNumber,
      projectPassword
    ).finally(() => setIsLoading(false));

    if (!storedProject) {
      setError("Project not found or password is incorrect.");
      return;
    }

    replaceProject(storedProject);
    router.push("/dashboard");
  };

  return (
    <main className="page">
      <section className="panelCard" style={{ padding: 32, gap: 18 }}>
        <div className="fieldNote" style={{ fontWeight: 800 }}>
          TEAM LOGIN
        </div>

        <h1>Access your project</h1>

        <p className="hero-subtitle">
          Enter your project number and password to continue where you left off.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 14 }}>
          <label className="fieldLabel">
            <span>Project number</span>
            <input
              value={projectNumber}
              onChange={(event) => setProjectNumber(event.target.value)}
              placeholder="E.g. TEAM-1234"
            />
          </label>

          <label className="fieldLabel">
            <span>Project password</span>
            <input
              type="password"
              value={projectPassword}
              onChange={(event) => setProjectPassword(event.target.value)}
              placeholder="Your project password"
            />
          </label>

          <button type="submit" className="button" disabled={isLoading}>
            {isLoading ? "Loading..." : "Load project"}
          </button>

          {error ? (
            <p style={{ color: "#b91c1c", margin: 0 }}>{error}</p>
          ) : null}
        </form>

        <Link href="/team-setup" className="button secondaryButton">
          Register a new project
        </Link>
      </section>
    </main>
  );
}
