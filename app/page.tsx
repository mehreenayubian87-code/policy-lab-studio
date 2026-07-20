import Link from "next/link";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <main className={styles.landingPage}>
      <section className={styles.hero}>
        <div className={styles.heroPanel}>
          <div className={styles.heroCopy}>
            <div className={styles.kicker}>
              POLICY LAB STUDIO
            </div>

            <h1>
              Policy Lab Studio
            </h1>

            <p className={styles.subtitle}>
              A guided workspace for developing evidence-informed policy solutions.
            </p>

            <div className={styles.actions}>
              <Link href="/team-setup" className={styles.primaryAction}>
                Register Team
              </Link>

              <Link href="/project-login" className={styles.secondaryAction}>
                Team Login
              </Link>

              <Link href="/professor-admin" className={styles.secondaryAction}>
                Admin Login
              </Link>
            </div>
          </div>

          <div className={styles.heroVideoCard}>
            <video
              className={styles.heroVideo}
              src="/images/video landing page.mp4"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
            />

            <div className={styles.videoCaption}>
              <span>Policy Lab in action</span>
            </div>
          </div>
        </div>

      </section>

      <footer className={styles.footer}>
        <div>
          Developed by <strong>Mehreen Afsar Jadoon (Student MGHP)</strong>
        </div>
        <div>
          Under the supervision of <strong>Dr. Evren Tok</strong>
        </div>
      </footer>
    </main>
  );
}
