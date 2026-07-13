"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./presentation.module.css";
import {
  buildPosterContent,
  readAllStudioObjects,
} from "@/components/ProjectState/projectService";

type PosterBlock = {
  id: string;
  title: string;
  type?: string;
  content: string;
  kind?: string;
  imageUrl?: string;
  caption?: string;
};

type PosterHeader = {
  title: string;
  subtitle: string;
  logo: string;
  team: string;
  course: string;
  instructor: string;
};

type ExportItem = {
  id: string;
  label: string;
  source: string;
  content: string;
  selected: boolean;
};

type PitchSection = {
  id: string;
  title: string;
  content: string;
  script: string;
  selected: boolean;
  open: boolean;
};

type JudgeQuestion = {
  id: string;
  question: string;
  answer: string;
  open: boolean;
};

type SavedPoster = {
  posterHeader?: PosterHeader;
  blocks?: PosterBlock[];
};

const PRESENTATION_STORAGE_KEY = "plstudio_presentation_v2";
const POSTER_STORAGE_KEYS = ["plstudio_poster_v2", "plstudio_poster_v1"];

const defaultPosterHeader: PosterHeader = {
  title: "Policy Poster Presentation",
  subtitle: "Prepare a clear presentation from your final poster.",
  logo: "🎤",
  team: "Team Name",
  course: "Course / Policy Lab",
  instructor: "Instructor",
};

const defaultQuestions = [
  "What specific policy problem is your poster addressing?",
  "Who is most affected by this problem, and why did you prioritize them?",
  "What is the strongest evidence supporting your problem statement?",
  "How does your proposed solution respond directly to the root causes?",
  "Which stakeholders are most important for implementation?",
  "What risks could affect implementation, and how would you manage them?",
  "What indicators would show that this policy is working?",
  "What resources, funding, or institutional support would be required?",
  "How would this policy be sustained beyond the initial implementation phase?",
  "What is the main limitation of your proposal, and how would you address it?",
];

const readSavedPoster = (): SavedPoster => {
  for (const key of POSTER_STORAGE_KEYS) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.blocks)) return parsed;
    } catch {
      continue;
    }
  }

  return {};
};

const cleanText = (value: string) => value.replace(/\s+/g, " ").trim();

const buildDefaultScript = (title: string, content: string) => {
  const cleanContent = cleanText(content);

  if (!cleanContent) {
    return `In this section, I will briefly explain the key point related to ${title.toLowerCase()}.`;
  }

  return `For ${title.toLowerCase()}, our poster highlights that ${cleanContent}`;
};

export default function PresentationStudioPage() {
  const [posterHeader, setPosterHeader] =
    useState<PosterHeader>(defaultPosterHeader);
  const [exportItems, setExportItems] = useState<ExportItem[]>([]);
  const [pitchSections, setPitchSections] = useState<PitchSection[]>([]);
  const [questions, setQuestions] = useState<JudgeQuestion[]>([]);
  const [activeSection, setActiveSection] = useState<
    "export" | "script" | "qa" | null
  >("export");
  const [lastSaved, setLastSaved] = useState("Not saved yet");
  const [statusMessage, setStatusMessage] = useState("");

  const selectedExportCount = useMemo(
    () => exportItems.filter((item) => item.selected).length,
    [exportItems]
  );

  const selectedPitchCount = useMemo(
    () => pitchSections.filter((section) => section.selected).length,
    [pitchSections]
  );

  useEffect(() => {
    const saved = localStorage.getItem(PRESENTATION_STORAGE_KEY);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPosterHeader(parsed.posterHeader || defaultPosterHeader);
        setExportItems(parsed.exportItems || []);
        setPitchSections(parsed.pitchSections || []);
        setQuestions(parsed.questions || []);
        setLastSaved(parsed.lastSaved || "Loaded saved work");
        return;
      } catch {
        localStorage.removeItem(PRESENTATION_STORAGE_KEY);
      }
    }

    importFromPoster();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      saveProgress("Auto-saved");
    }, 45000);

    return () => clearInterval(timer);
  });

  const importFromPoster = () => {
    const savedPoster = readSavedPoster();
    const studioObjects = readAllStudioObjects();
    const fallbackContent = buildPosterContent(studioObjects);

    const header = savedPoster.posterHeader || defaultPosterHeader;
    const posterBlocks = Array.isArray(savedPoster.blocks)
      ? savedPoster.blocks
      : [];

    const sectionBlocks: PosterBlock[] =
      posterBlocks.length > 0
        ? posterBlocks
        : [
            {
              id: "problem",
              title: "Problem",
              content: fallbackContent.problem || "",
              kind: "section",
            },
            {
              id: "evidence",
              title: "Evidence",
              content: fallbackContent.evidence || "",
              kind: "section",
            },
            {
              id: "stakeholders",
              title: "Stakeholders",
              content: fallbackContent.stakeholders || "",
              kind: "section",
            },
            {
              id: "population",
              title: "Target Population / Journey",
              content: fallbackContent.population || "",
              kind: "section",
            },
            {
              id: "solution",
              title: "Solution",
              content: fallbackContent.solution || "",
              kind: "section",
            },
            {
              id: "implementation",
              title: "Implementation",
              content: fallbackContent.implementation || "",
              kind: "section",
            },
            {
              id: "risks",
              title: "Risks",
              content: fallbackContent.risks || "",
              kind: "section",
            },
            {
              id: "indicators",
              title: "Indicators",
              content: fallbackContent.indicators || "",
              kind: "section",
            },
          ];

    const exportList: ExportItem[] = [
      {
        id: "poster-title",
        label: header.title || "Poster Title",
        source: "Final Poster Header",
        content: header.subtitle || "",
        selected: true,
      },
      ...sectionBlocks.map((block) => ({
        id: block.id,
        label: block.title,
        source:
          block.kind === "image"
            ? "Poster Image"
            : block.kind === "chart"
            ? "Poster Chart"
            : block.kind === "icon"
            ? "Poster Icon"
            : "Final Poster Section",
        content:
          block.kind === "image"
            ? block.caption || block.content || "Image included in poster."
            : block.content || "",
        selected: true,
      })),
    ];

    const pitchList: PitchSection[] = [
      {
        id: "opening",
        title: "Opening",
        content: header.subtitle || "",
        script: `Good morning. Our presentation is based on our poster titled "${header.title}". We will briefly explain the policy problem, evidence, solution, implementation plan, and expected impact.`,
        selected: true,
        open: true,
      },
      ...sectionBlocks.map((block) => ({
        id: block.id,
        title: block.title,
        content: block.content || "",
        script: buildDefaultScript(block.title, block.content || ""),
        selected: true,
        open: false,
      })),
      {
        id: "closing",
        title: "Closing",
        content: "",
        script:
          "To conclude, our proposal is evidence-informed, implementation-focused, and designed to support better policy outcomes. Thank you.",
        selected: true,
        open: false,
      },
    ];

    const questionList: JudgeQuestion[] = defaultQuestions.map(
      (question, index) => ({
        id: `q${index + 1}`,
        question,
        answer: "",
        open: false,
      })
    );

    setPosterHeader(header);
    setExportItems(exportList);
    setPitchSections(pitchList);
    setQuestions(questionList);
    setStatusMessage("Imported latest saved poster content.");
  };

  const saveProgress = (message = "Saved") => {
    const savedAt = new Date().toLocaleTimeString();

    localStorage.setItem(
      PRESENTATION_STORAGE_KEY,
      JSON.stringify({
        posterHeader,
        exportItems,
        pitchSections,
        questions,
        lastSaved: `${message} at ${savedAt}`,
      })
    );

    setLastSaved(`${message} at ${savedAt}`);
    setStatusMessage(`${message} successfully.`);
  };

  const toggleMainSection = (section: "export" | "script" | "qa") => {
    setActiveSection((current) => (current === section ? null : section));
  };

  const toggleExportItem = (id: string) => {
    setExportItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const togglePitchSelection = (id: string) => {
    setPitchSections((prev) =>
      prev.map((section) =>
        section.id === id
          ? { ...section, selected: !section.selected }
          : section
      )
    );
  };

  const togglePitchOpen = (id: string) => {
    setPitchSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, open: !section.open } : section
      )
    );
  };

  const updatePitch = (id: string, script: string) => {
    setPitchSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, script } : section
      )
    );
  };

  const toggleQuestionOpen = (id: string) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === id
          ? { ...question, open: !question.open }
          : question
      )
    );
  };

  const updateAnswer = (id: string, answer: string) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === id ? { ...question, answer } : question
      )
    );
  };

  const preparePowerPointExport = () => {
    const slides = exportItems
      .filter((item) => item.selected)
      .map(
        (item) => `
          <section>
            <h1>${item.label}</h1>
            <p><strong>Source:</strong> ${item.source}</p>
            <p>${item.content || "Add slide content here."}</p>
          </section>
        `
      )
      .join("");

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            body { font-family: Arial, sans-serif; color: #0f2f66; }
            section { page-break-after: always; padding: 48px; }
            h1 { color: #0f2f66; font-size: 34px; }
            p { font-size: 20px; line-height: 1.5; }
          </style>
        </head>
        <body>${slides}</body>
      </html>
    `;

    const blob = new Blob([html], {
      type: "application/vnd.ms-powerpoint",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "policy-lab-presentation.ppt";
    a.click();
    URL.revokeObjectURL(url);

    setStatusMessage("Presentation export prepared.");
  };

  return (
    <main className="page">
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <div className={styles.kicker}>POLICY LAB STUDIO</div>

          <h1 className={styles.pageTitle}>Presentation Studio</h1>

          <p className={styles.subtitle}>
            Prepare your PowerPoint presentation, pitch script, and judges’
            Q&amp;A from your completed poster.
          </p>

          <p className={styles.savedText}>{lastSaved}</p>
        </div>

        <div className={styles.headerActions}>
          <Link href="/" className="button secondaryButton">
            Home
          </Link>

          <Link href="/dashboard" className="button secondaryButton">
            Dashboard
          </Link>

          <Link href="/poster" className="button secondaryButton">
            Previous Studio
          </Link>

<Link href="/portfolio" className="button secondaryButton">
  Next Studio
</Link>

          <button
            type="button"
            className="button secondaryButton"
            onClick={importFromPoster}
          >
            Import Latest Poster
          </button>

          <button
            type="button"
            className="button secondaryButton"
            onClick={() => saveProgress()}
          >
            Save Progress
          </button>

          <button type="button" className="button" onClick={preparePowerPointExport}>
            Export as PPT
          </button>
        </div>
      </section>

      {statusMessage ? (
        <div className={styles.statusBanner}>{statusMessage}</div>
      ) : null}

      <section className={styles.verticalSections}>
        <article className={styles.accordionItem}>
          <button
            type="button"
            className={`${styles.sectionHeader} ${
              activeSection === "export" ? styles.sectionHeaderActive : ""
            }`}
            onClick={() => toggleMainSection("export")}
          >
            <span>1. Export as PPT</span>
            <strong>
              {activeSection === "export" ? "Collapse" : "Expand"} ·{" "}
              {selectedExportCount}/{exportItems.length} selected
            </strong>
          </button>

          {activeSection === "export" ? (
            <section className={styles.sectionBody}>
              <p className={styles.sectionIntro}>
                Select the final poster sections and additional boxes you want
                to include in the presentation export.
              </p>

              <div className={styles.checkGrid}>
                {exportItems.map((item) => (
                  <label key={item.id} className={styles.checkCard}>
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleExportItem(item.id)}
                    />

                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.source}</small>
                    </span>
                  </label>
                ))}
              </div>

              <div className={styles.sectionActions}>
                <button
                  type="button"
                  className="button secondaryButton"
                  onClick={() =>
                    setExportItems((prev) =>
                      prev.map((item) => ({ ...item, selected: true }))
                    )
                  }
                >
                  Select All
                </button>

                <button
                  type="button"
                  className="button secondaryButton"
                  onClick={() =>
                    setExportItems((prev) =>
                      prev.map((item) => ({ ...item, selected: false }))
                    )
                  }
                >
                  Clear
                </button>

                <button
                  type="button"
                  className="button"
                  onClick={preparePowerPointExport}
                >
                  Prepare PPT Export
                </button>
              </div>
            </section>
          ) : null}
        </article>

        <article className={styles.accordionItem}>
          <button
            type="button"
            className={`${styles.sectionHeader} ${
              activeSection === "script" ? styles.sectionHeaderActive : ""
            }`}
            onClick={() => toggleMainSection("script")}
          >
            <span>2. Script for Pitch</span>
            <strong>
              {activeSection === "script" ? "Collapse" : "Expand"} ·{" "}
              {selectedPitchCount}/{pitchSections.length} included
            </strong>
          </button>

          {activeSection === "script" ? (
            <section className={styles.sectionBody}>
              <p className={styles.sectionIntro}>
                Import and edit the script from the final poster headings. Each
                subsection opens only when clicked.
              </p>

              <div className={styles.pitchList}>
                {pitchSections.map((section) => (
                  <article key={section.id} className={styles.pitchCard}>
                    <div className={styles.pitchHeader}>
                      <label>
                        <input
                          type="checkbox"
                          checked={section.selected}
                          onChange={() => togglePitchSelection(section.id)}
                        />{" "}
                        <strong>{section.title}</strong>
                      </label>

                      <button
                        type="button"
                        className="button secondaryButton"
                        onClick={() => togglePitchOpen(section.id)}
                      >
                        {section.open ? "Hide" : "Open"}
                      </button>
                    </div>

                    {section.open ? (
                      <div className={styles.pitchContent}>
                        {section.content ? (
                          <div className={styles.importedContent}>
                            <strong>Imported poster content</strong>
                            <p>{section.content}</p>
                          </div>
                        ) : null}

                        <label className="fieldLabel">
                          <span>Editable pitch script</span>
                          <textarea
                            rows={6}
                            value={section.script}
                            onChange={(event) =>
                              updatePitch(section.id, event.target.value)
                            }
                          />
                        </label>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </article>

        <article className={styles.accordionItem}>
          <button
            type="button"
            className={`${styles.sectionHeader} ${
              activeSection === "qa" ? styles.sectionHeaderActive : ""
            }`}
            onClick={() => toggleMainSection("qa")}
          >
            <span>3. Judges Q&amp;A</span>
            <strong>
              {activeSection === "qa" ? "Collapse" : "Expand"} ·{" "}
              {questions.length} questions
            </strong>
          </button>

          {activeSection === "qa" ? (
            <section className={styles.sectionBody}>
              <p className={styles.sectionIntro}>
                Open each question and prepare your own answer. The answer boxes
                are intentionally empty so students actively prepare.
              </p>

              <div className={styles.qaList}>
                {questions.map((question, index) => (
                  <article key={question.id} className={styles.qaCard}>
                    <button
                      type="button"
                      className={styles.qaQuestion}
                      onClick={() => toggleQuestionOpen(question.id)}
                    >
                      <strong>
                        {index + 1}. {question.question}
                      </strong>
                      <span>{question.open ? "Hide" : "Open"}</span>
                    </button>

                    {question.open ? (
                      <textarea
                        rows={5}
                        value={question.answer}
                        onChange={(event) =>
                          updateAnswer(question.id, event.target.value)
                        }
                        placeholder="Prepare your answer here..."
                      />
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </section>
    </main>
  );
}
