"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProject } from "@/components/ProjectState/ProjectProvider";
import { loadProjectByNumberAndPassword } from "@/components/ProjectState/projectStorage";
import styles from "./page.module.css";

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
    <main className={styles.loginPage}>
      <section className={styles.loginCard}>
        <div className={styles.headerBlock}>
          <div className={styles.kicker}>TEAM LOGIN</div>

          <h1>Access your project</h1>

          <p>
            Enter your project number and password to continue where you left off.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <label className={styles.fieldLabel}>
            <span>Project number</span>
            <input
              value={projectNumber}
              onChange={(event) => setProjectNumber(event.target.value)}
              placeholder="E.g. TEAM-1234"
            />
          </label>

          <label className={styles.fieldLabel}>
            <span>Project password</span>
            <input
              type="password"
              value={projectPassword}
              onChange={(event) => setProjectPassword(event.target.value)}
              placeholder="Your project password"
            />
          </label>

          <button type="submit" className={styles.primaryAction} disabled={isLoading}>
            {isLoading ? "Loading..." : "Load project"}
          </button>

          {error ? (
            <p className={styles.errorText}>{error}</p>
          ) : null}
        </form>

        <Link href="/" className={styles.secondaryAction}>
          Back to home
        </Link>
      </section>
    </main>
  );
}
