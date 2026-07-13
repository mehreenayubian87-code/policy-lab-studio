"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import styles from "./StudioShell.module.css";

type StudioShellProps = {
  title: string;
  previousHref?: string;
  nextHref?: string;
  dashboardHref: string;
  onSave: () => void;
  savedMessage?: string;
  tools: ReactNode;
  workspace: ReactNode;
  review: ReactNode;
};

export default function StudioShell({
  title,
  previousHref,
  nextHref,
  dashboardHref,
  savedMessage,
  tools,
  workspace,
  review,
}: StudioShellProps) {
  const [openPanel, setOpenPanel] = useState<"tools" | "review" | null>(null);

  const togglePanel = (panel: "tools" | "review") => {
    setOpenPanel((current) => (current === panel ? null : panel));
  };

  return (
    <main className="page">
      <header className={styles.header}>
        <h1>{title}</h1>

        <div className={styles.headerRight}>
          <div className={styles.navActions}>
            {previousHref ? (
              <Link href={previousHref} className="button secondaryButton">
                Previous Studio
              </Link>
            ) : null}

            {nextHref ? (
              <Link href={nextHref} className="button secondaryButton">
                Next Studio
              </Link>
            ) : null}

            <Link href={dashboardHref} className="button secondaryButton">
              Go to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {savedMessage ? <div className="savedBanner">{savedMessage}</div> : null}

      <section className={styles.shell}>
        <button
          type="button"
          className={`${styles.panelToggle} ${styles.leftToggle}`}
          onClick={() => togglePanel("tools")}
        >
          Tools
        </button>

        {openPanel === "tools" ? (
          <aside className={styles.toolsPanel}>{tools}</aside>
        ) : null}

        <section className={styles.workspace}>{workspace}</section>

        {openPanel === "review" ? (
          <aside className={styles.reviewPanel}>{review}</aside>
        ) : null}

        <button
          type="button"
          className={`${styles.panelToggle} ${styles.rightToggle}`}
          onClick={() => togglePanel("review")}
        >
          Review
        </button>
      </section>
    </main>
  );
}
