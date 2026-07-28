"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { useAdminSession } from "@/components/TeamAccess/TeamSessionBar";
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
  onAlert?: () => void;
  alertLabel?: string;
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
  onAlert,
  alertLabel = "Alert Admin",
}: StudioShellProps) {
  const isAdminSession = useAdminSession();
  const [openPanel, setOpenPanel] = useState<"tools" | "review" | null>(null);
  const studioTitle = title.endsWith(" Studio")
    ? title.replace(/ Studio$/, "")
    : title;

  const togglePanel = (panel: "tools" | "review") => {
    setOpenPanel((current) => (current === panel ? null : panel));
  };

  return (
    <main className={`page ${styles.studioPage}`}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <span>Policy Lab Studio</span>
          <h1>
            {studioTitle}
            {title.endsWith(" Studio") ? (
              <>
                <br />
                Studio
              </>
            ) : null}
          </h1>
        </div>

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
              Dashboard
            </Link>

            {onAlert && isAdminSession === false ? (
              <div className={styles.alertRow}>
                <button
                  type="button"
                  className={`button ${styles.alertButton}`}
                  onClick={onAlert}
                >
                  {alertLabel}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {savedMessage ? <div className="savedBanner">{savedMessage}</div> : null}

      <section className={styles.shell}>
        <button
          type="button"
          className={`${styles.panelToggle} ${styles.leftToggle}`}
          onClick={() => togglePanel("tools")}
          aria-pressed={openPanel === "tools"}
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
          aria-pressed={openPanel === "review"}
        >
          Review
        </button>
      </section>
    </main>
  );
}
