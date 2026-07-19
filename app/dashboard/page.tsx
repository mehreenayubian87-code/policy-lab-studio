"use client";

import Link from "next/link";
import styles from "./dashboard.module.css";

type Studio = {
  number: string;
  title: string;
  href: string;
  phase: string;
  description: string;
  output: string;
};

const studios: Studio[] = [
  {
    number: "01",
    title: "Problem & Evidence Studio",
    href: "/problem-evidence",
    phase: "Understand",
    description:
      "Explore the policy problem, organise evidence, identify affected groups, and frame the core question.",
    output:
      "Problem frame, evidence notes, affected population, assumptions, and poster-ready problem content.",
  },
  {
    number: "02",
    title: "Process Studio",
    href: "/stakeholder-systems",
    phase: "Map",
    description:
      "Map stakeholders, participation, power dynamics, systems relationships, gaps, and opportunities.",
    output:
      "Stakeholder analysis, participation layers, process map, policy canvas, and opportunity areas.",
  },
  {
    number: "03",
    title: "Solution Studio",
    href: "/solution",
    phase: "Design",
    description:
      "Develop policy options, compare alternatives, build a theory of change, and identify risks and indicators.",
    output:
      "Solution options, theory of change, beneficiaries, delivery model, risks, indicators, and rollout strategy.",
  },
  {
    number: "04",
    title: "Implementation Studio",
    href: "/implementation",
    phase: "Plan",
    description:
      "Plan governance, ownership, activities, resources, timeline, monitoring, and scale-up.",
    output:
      "Implementation plan, activity table, budget, timeline, risk plan, and monitoring indicators.",
  },
  {
    number: "05",
    title: "Poster Studio",
    href: "/poster",
    phase: "Assemble",
    description:
      "Bring together outputs from the previous studios and organise the final policy poster.",
    output:
      "Poster canvas, structured content, visuals, review notes, and final poster.",
  },
  {
    number: "06",
    title: "Presentation Studio",
    href: "/presentation",
    phase: "Present",
    description:
      "Prepare the final presentation, pitch script, speaker flow, and likely judges’ questions.",
    output:
      "Presentation flow, pitch script, judges’ questions, and final readiness checklist.",
  },
  {
    number: "07",
    title: "Policy Portfolio",
    href: "/portfolio",
    phase: "Explore",
    description:
      "Browse previous student posters organised by cohort as a reference archive.",
    output:
      "Previous cohort posters organised by program and year.",
  },
];

export default function Dashboard() {
  return (
    <main className={styles.dashboardPage}>
      <div className={styles.dashboardInner}>
        <section className={styles.heroCard}>
          <div className={styles.heroText}>
            <div className={styles.kicker}>
            Policy Lab Studio
            </div>

            <h1 className={styles.heroTitle}>Studio Dashboard</h1>

            <p className={styles.heroSubtitle}>
              Access each studio and move through the Policy Lab journey in
              sequence.
            </p>
          </div>

          <div className={styles.startPanel}>
            <strong>Begin the workflow</strong>

            <p>Start with the Problem & Evidence Studio.</p>

            <Link href="/problem-evidence" className="button">
              Start Studio 1
            </Link>
          </div>

          <section className={styles.pathwayCard}>
            <div className={styles.pathwayContent}>
              <div className={styles.sectionHeader}>
                <h2>Policy Lab Pathway</h2>

                <p className={styles.sectionIntro}>
                  Policy Lab studios with a brief description of each stage.
                </p>
              </div>

              <div className={styles.pathwayScroller}>
                <div className={styles.pathwayTrack}>
                  {studios.map((studio, index) => (
                    <div key={studio.number} className={styles.pathwayStep}>
                      <Link href={studio.href} className={styles.studioCard}>
                        <div className={styles.studioTop}>
                          <div className={styles.studioNumber}>
                            {studio.number}
                          </div>

                          <span className={styles.studioPhase}>
                            {studio.phase}
                          </span>
                        </div>

                        <h3 className={styles.studioTitle}>{studio.title}</h3>

                        <p className={styles.studioDescription}>
                          {studio.description}
                        </p>

                        <div className={styles.outputBlock}>
                          <strong>Expected output</strong>

                          <p className={styles.studioOutput}>{studio.output}</p>
                        </div>

                        <span className={`button ${styles.openButton}`}>
                          Open Studio
                        </span>
                      </Link>

                      {index < studios.length - 1 ? (
                        <div aria-hidden="true" className={styles.pathwayArrow}>
                          →
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className={styles.footerCard}>
            <div className={styles.footerContent}>
              <Link href="/" className="button secondaryButton">
                Back to Home
              </Link>

              <div className={styles.footerActions}>
                <Link href="/team-setup" className="button secondaryButton">
                  Back to Team Setup
                </Link>

                <Link href="/resource-hub" className="button secondaryButton">
                  Open Resource Hub
                </Link>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
