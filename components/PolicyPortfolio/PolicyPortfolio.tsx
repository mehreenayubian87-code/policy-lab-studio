"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import styles from "./PolicyPortfolio.module.css";
import {
  portfolioCohorts,
  portfolioPosters,
  type PortfolioPoster,
} from "./portfolioLibrary";

export default function PolicyPortfolio() {
  const [selectedCohortId, setSelectedCohortId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedPoster, setSelectedPoster] =
    useState<PortfolioPoster | null>(null);

  const selectedCohort = selectedCohortId
    ? portfolioCohorts.find((cohort) => cohort.id === selectedCohortId) ?? null
    : null;

  const visiblePosters = useMemo(() => {
    if (!selectedCohortId) return [];

    const query = search.trim().toLowerCase();

    return portfolioPosters.filter((poster) => {
      const belongsToCohort = poster.cohortId === selectedCohortId;

      const matchesSearch =
        !query ||
        [poster.title, poster.group, poster.cohortLabel, poster.program]
          .join(" ")
          .toLowerCase()
          .includes(query);

      return belongsToCohort && matchesSearch;
    });
  }, [search, selectedCohortId]);

  const openCohort = (id: string) => {
    setSelectedCohortId(id);
    setSearch("");

    requestAnimationFrame(() => {
      document
        .getElementById("portfolioContent")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const returnToCohorts = () => {
    setSelectedCohortId(null);
    setSearch("");
  };

  return (
    <main className="page">
      <section className={styles.hero}>
        <div>
          <div className={styles.kicker}>POLICY LAB STUDIO</div>
          <h1>Policy Portfolio</h1>
        </div>

        <div className={styles.heroActions}>
          <Link href="/presentation" className="button secondaryButton">
            Back to Presentation Studio
          </Link>

          <Link href="/dashboard" className="button secondaryButton">
            Go to Dashboard
          </Link>
        </div>
      </section>

      <section id="portfolioContent" className={styles.portfolioSection}>
        {!selectedCohort ? (
          <>
            <div className={styles.sectionHeading}>
              <div>
                <div className={styles.kicker}>PREVIOUS COHORTS</div>
                <h2>Select a cohort</h2>
              </div>
            </div>

            <div className={styles.cohortGrid}>
              {portfolioCohorts.map((cohort) => (
                <button
                  key={cohort.id}
                  type="button"
                  className={styles.cohortCard}
                  onClick={() => openCohort(cohort.id)}
                >
                  <span>{cohort.program}</span>
                  <h3>{cohort.label.replace(`${cohort.program} – `, "")}</h3>
                  <p>{cohort.count} posters</p>
                  <strong>Open cohort →</strong>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className={styles.selectedCohortHeader}>
              <div>
                <button
                  type="button"
                  className={styles.backButton}
                  onClick={returnToCohorts}
                >
                  ← Back to cohorts
                </button>

                <div className={styles.kicker}>POSTER ARCHIVE</div>
                <h2>{selectedCohort.label}</h2>
              </div>
            </div>

            <div className={styles.searchRow}>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search within this cohort..."
              />
            </div>

            {visiblePosters.length === 0 ? (
              <div className={styles.emptyState}>
                No posters match your search.
              </div>
            ) : (
              <div className={styles.posterGrid}>
                {visiblePosters.map((poster) => (
                  <button
                    key={poster.id}
                    type="button"
                    className={styles.editorialCard}
                    onClick={() => setSelectedPoster(poster)}
                    aria-label={`View ${poster.group} poster`}
                  >
                    <div className={styles.editorialAccent} />

                    <div className={styles.editorialMeta}>
                      {poster.program} ·{" "}
                      {poster.cohortLabel.replace(
                        `${poster.program} – `,
                        ""
                      )}
                    </div>

                    <div className={styles.editorialBody}>
                      <h3>{poster.group}</h3>
                      <p>Previous Policy Lab Poster</p>
                    </div>

                    <div className={styles.editorialAction}>
                      View Poster <span>→</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      <section className={styles.closingNote}>
        <div className={styles.closingAccent} />
        <div>
          <strong>Good luck with your policy project.</strong>
          <p>
            We look forward to seeing how you transform evidence, ideas, and
            collaboration into a thoughtful policy solution.
          </p>
        </div>
      </section>

      {selectedPoster ? (
        <div
          className={styles.modalBackdrop}
          onClick={() => setSelectedPoster(null)}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-label={`${selectedPoster.group} poster preview`}
            onClick={(event) => event.stopPropagation()}
          >
            <header className={styles.modalHeader}>
              <div>
                <span>{selectedPoster.program}</span>
                <h2>{selectedPoster.group}</h2>
                <p>{selectedPoster.cohortLabel}</p>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setSelectedPoster(null)}
                aria-label="Close poster preview"
              >
                ×
              </button>
            </header>

            <div className={styles.pdfFrame}>
              <iframe
                key={selectedPoster.pdfUrl}
                src={selectedPoster.pdfUrl}
                title={`${selectedPoster.group} poster`}
              />
            </div>

            <footer className={styles.modalActions}>
              <a
                href={selectedPoster.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="button"
              >
                Open Full Poster
              </a>

              <a
                href={selectedPoster.pdfUrl}
                download
                className="button secondaryButton"
              >
                Download PDF
              </a>

              <button
                type="button"
                className="button secondaryButton"
                onClick={() => setSelectedPoster(null)}
              >
                Back to Portfolio
              </button>
            </footer>
          </section>
        </div>
      ) : null}
    </main>
  );
}
