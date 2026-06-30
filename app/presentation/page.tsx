"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";

type TeamMember = { name: string; role?: string };
type Team = {
  groupNumber?: number;
  groupName?: string;
  courseName?: string;
  instructorName?: string;
  students?: TeamMember[];
};

type PitchSection = {
  id: string;
  title: string;
  source: string;
  sourceContent: string;
  suggestedPoints: string[];
  script: string;
  speaker: string;
  timing: string;
  complete: boolean;
};

type JudgeQuestion = {
  id: string;
  difficulty: "Basic" | "Intermediate" | "Challenging" | "Professor-level";
  theme: string;
  question: string;
  answer: string;
  feedback: string;
};

type ChecklistItem = {
  id: string;
  label: string;
  checked: boolean;
};

const now = () => new Date().toISOString();

const defaultPitchSections: PitchSection[] = [
  {
    id: "opening",
    title: "Opening",
    source: "Poster Studio",
    sourceContent:
      "Introduce the project title, team, policy challenge, and why the topic matters.",
    suggestedPoints: [
      "Start with a clear opening sentence.",
      "Name the policy issue.",
      "Explain why the audience should care.",
    ],
    script: "",
    speaker: "",
    timing: "20 seconds",
    complete: false,
  },
  {
    id: "problem",
    title: "Problem & Evidence",
    source: "Problem & Evidence Studio",
    sourceContent:
      "Problem statement, evidence summary, affected population, root causes, assumptions, and HMW question.",
    suggestedPoints: [
      "What is the problem?",
      "Who is affected?",
      "What evidence supports the problem?",
      "What is the key gap or need?",
    ],
    script: "",
    speaker: "",
    timing: "45 seconds",
    complete: false,
  },
  {
    id: "process",
    title: "Stakeholders & Process",
    source: "Process Studio",
    sourceContent:
      "Stakeholder map, power-interest analysis, participation approach, system relationships, and opportunity areas.",
    suggestedPoints: [
      "Who are the main stakeholders?",
      "Who has power and who is affected?",
      "How did the process shape the solution?",
    ],
    script: "",
    speaker: "",
    timing: "35 seconds",
    complete: false,
  },
  {
    id: "solution",
    title: "Proposed Solution",
    source: "Solution Studio",
    sourceContent:
      "Selected intervention, solution options, beneficiaries, theory of change, and expected outcomes.",
    suggestedPoints: [
      "What solution are you proposing?",
      "Why this solution instead of another option?",
      "How does it respond to the problem?",
    ],
    script: "",
    speaker: "",
    timing: "45 seconds",
    complete: false,
  },
  {
    id: "implementation",
    title: "Implementation Plan",
    source: "Implementation Studio",
    sourceContent:
      "Governance, delivery roles, activities, partners, timeline, budget, resources, and implementation pathway.",
    suggestedPoints: [
      "Who will lead implementation?",
      "What are the main activities?",
      "What is the timeline?",
      "What resources are needed?",
    ],
    script: "",
    speaker: "",
    timing: "50 seconds",
    complete: false,
  },
  {
    id: "risks",
    title: "Risks & Mitigation",
    source: "Implementation Studio",
    sourceContent:
      "Risk register, likelihood, impact, mitigation strategies, contingency planning, and escalation actions.",
    suggestedPoints: [
      "What are the most important risks?",
      "How will you reduce or manage them?",
      "What is your contingency plan?",
    ],
    script: "",
    speaker: "",
    timing: "35 seconds",
    complete: false,
  },
  {
    id: "monitoring",
    title: "Monitoring & Impact",
    source: "Solution + Implementation Studios",
    sourceContent:
      "Indicators, baseline, targets, data sources, monitoring plan, expected outcomes, and impact measures.",
    suggestedPoints: [
      "How will success be measured?",
      "What indicators matter most?",
      "What impact do you expect?",
    ],
    script: "",
    speaker: "",
    timing: "35 seconds",
    complete: false,
  },
  {
    id: "closing",
    title: "Closing Message",
    source: "Poster Studio",
    sourceContent:
      "Final recommendation, value proposition, and closing statement for judges or professors.",
    suggestedPoints: [
      "End with a clear recommendation.",
      "Mention why the policy is feasible.",
      "Close confidently.",
    ],
    script: "",
    speaker: "",
    timing: "20 seconds",
    complete: false,
  },
];

const defaultQuestions: JudgeQuestion[] = [
  {
    id: "q1",
    difficulty: "Basic",
    theme: "Problem framing",
    question: "Why did you choose this policy problem, and why is it important now?",
    answer: "",
    feedback: "",
  },
  {
    id: "q2",
    difficulty: "Basic",
    theme: "Evidence",
    question: "What is the strongest evidence supporting your problem statement?",
    answer: "",
    feedback: "",
  },
  {
    id: "q3",
    difficulty: "Intermediate",
    theme: "Solution choice",
    question: "Why did you choose this intervention instead of other possible policy options?",
    answer: "",
    feedback: "",
  },
  {
    id: "q4",
    difficulty: "Intermediate",
    theme: "Stakeholders",
    question: "Which stakeholder may resist this policy, and how would you engage them?",
    answer: "",
    feedback: "",
  },
  {
    id: "q5",
    difficulty: "Intermediate",
    theme: "Implementation",
    question: "Who will lead implementation, and what makes the delivery plan realistic?",
    answer: "",
    feedback: "",
  },
  {
    id: "q6",
    difficulty: "Challenging",
    theme: "Budget",
    question: "How do you justify the budget, and what would you cut if funding was reduced?",
    answer: "",
    feedback: "",
  },
  {
    id: "q7",
    difficulty: "Challenging",
    theme: "Risk and mitigation",
    question: "What is the biggest implementation risk, and what is your mitigation strategy?",
    answer: "",
    feedback: "",
  },
  {
    id: "q8",
    difficulty: "Challenging",
    theme: "Monitoring",
    question: "How will you know whether your policy is working after implementation?",
    answer: "",
    feedback: "",
  },
  {
    id: "q9",
    difficulty: "Professor-level",
    theme: "Theory of change",
    question: "What assumptions must hold true for your theory of change to be realistic?",
    answer: "",
    feedback: "",
  },
  {
    id: "q10",
    difficulty: "Professor-level",
    theme: "Sustainability",
    question: "How will this policy continue after the first phase or initial funding ends?",
    answer: "",
    feedback: "",
  },
  {
    id: "q11",
    difficulty: "Professor-level",
    theme: "Equity",
    question: "Who could be unintentionally excluded or harmed by your proposed solution?",
    answer: "",
    feedback: "",
  },
  {
    id: "q12",
    difficulty: "Professor-level",
    theme: "Policy defense",
    question: "If judges disagree with your solution, what is your strongest defense?",
    answer: "",
    feedback: "",
  },
];

const defaultChecklist: ChecklistItem[] = [
  { id: "poster", label: "Poster is complete and reviewed", checked: false },
  { id: "problem", label: "Problem and evidence can be explained clearly", checked: false },
  { id: "stakeholders", label: "Stakeholders and power dynamics are ready to discuss", checked: false },
  { id: "solution", label: "Solution choice can be defended", checked: false },
  { id: "implementation", label: "Implementation plan is realistic", checked: false },
  { id: "budget", label: "Budget and funding explanation is prepared", checked: false },
  { id: "risks", label: "Risks and mitigation are ready", checked: false },
  { id: "monitoring", label: "Monitoring and success indicators are clear", checked: false },
  { id: "speakers", label: "Speaker roles and timing are assigned", checked: false },
  { id: "qa", label: "Judges Q&A has been practiced", checked: false },
];

export default function PresentationStudio() {
  const [team, setTeam] = useState<Team | null>(null);
  const [editor, setEditor] = useState("");
  const [saved, setSaved] = useState("");
  const [currentTab, setCurrentTab] = useState<"presentation" | "questions" | "readiness">("presentation");
  const [pitchSections, setPitchSections] = useState<PitchSection[]>(defaultPitchSections);
  const [questions, setQuestions] = useState<JudgeQuestion[]>(defaultQuestions);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(defaultChecklist);
  const [coachMessage, setCoachMessage] = useState("");

  useEffect(() => {
    try {
      const rawTeam = localStorage.getItem("plstudio_team");
      if (rawTeam) {
        const parsed = JSON.parse(rawTeam);
        setTeam(parsed);
        setEditor(parsed.students?.[0]?.name || parsed.instructorName || "");
      }

      const raw = localStorage.getItem("plstudio_presentation_v1");
      if (raw) {
        const data = JSON.parse(raw);
        if (Array.isArray(data.pitchSections)) setPitchSections(data.pitchSections);
        if (Array.isArray(data.questions)) setQuestions(data.questions);
        if (Array.isArray(data.checklist)) setChecklist(data.checklist);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const members = useMemo(() => {
    const list = [
      ...(team?.students ?? []),
      ...(team?.instructorName ? [{ name: team.instructorName, role: "Professor" }] : []),
    ];

    return list.filter(
      (member, index, arr) =>
        member.name && index === arr.findIndex((item) => item.name === member.name)
    );
  }, [team]);

  const completedPitch = pitchSections.filter((section) => section.complete).length;
  const answeredQuestions = questions.filter((question) => question.answer.trim()).length;
  const readyItems = checklist.filter((item) => item.checked).length;
  const readinessScore = Math.round(
    ((completedPitch / pitchSections.length) * 40) +
      ((answeredQuestions / questions.length) * 30) +
      ((readyItems / checklist.length) * 30)
  );

  const saveProgress = () => {
    localStorage.setItem(
      "plstudio_presentation_v1",
      JSON.stringify({
        pitchSections,
        questions,
        checklist,
        savedBy: editor,
        savedAt: now(),
      })
    );

    setSaved("Progress saved.");
    setTimeout(() => setSaved(""), 2000);
  };

  const updatePitchSection = (
    id: string,
    key: keyof PitchSection,
    value: string | boolean
  ) => {
    setPitchSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, [key]: value } : section
      )
    );
  };

  const updateQuestion = (
    id: string,
    key: keyof JudgeQuestion,
    value: string
  ) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === id ? { ...question, [key]: value } : question
      )
    );
  };

  const toggleChecklist = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const runPresentationCoach = () => {
    const incomplete = pitchSections.filter((section) => !section.complete);
    if (incomplete.length > 0) {
      setCoachMessage(
        `AI Presentation Coach: ${incomplete.length} presentation section(s) are not marked complete. Start with ${incomplete[0].title}. Check that the script is clear, short, and linked to the poster.`
      );
      return;
    }

    if (answeredQuestions < 5) {
      setCoachMessage(
        "AI Presentation Coach: The pitch flow is complete, but judges Q&A practice is still limited. Practice at least five questions before presenting."
      );
      return;
    }

    setCoachMessage(
      "AI Presentation Coach: Your presentation structure looks ready. Now rehearse timing, transitions between speakers, and your strongest answer for budget, risk, and sustainability questions."
    );
  };

  const generateFeedback = (question: JudgeQuestion) => {
    if (!question.answer.trim()) {
      updateQuestion(
        question.id,
        "feedback",
        "Write a short answer first. A strong response should include evidence, a clear policy reason, and one limitation or mitigation."
      );
      return;
    }

    updateQuestion(
      question.id,
      "feedback",
      "AI feedback placeholder: Good start. Strengthen this answer by linking it to evidence from your poster, naming the relevant stakeholder, and explaining the implementation implication."
    );
  };

  return (
    <main className="page">
      <section
        className="panelCard"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(280px, 0.8fr)",
          gap: 24,
          alignItems: "center",
          padding: 28,
          marginBottom: 22,
        }}
      >
        <div>
          <h1 style={{ marginBottom: 8 }}>Presentation Studio</h1>

          <h2
            style={{
              fontSize: "1.6rem",
              fontWeight: 600,
              color: "#42526b",
              marginBottom: 14,
              lineHeight: 1.25,
            }}
          >
            Prepare your pitch and defend your policy project
          </h2>

          <p className="hero-subtitle" style={{ marginBottom: 10 }}>
            Use your completed studio work as a presentation flow, assign speakers, rehearse timing,
            and practice likely judges' questions.
          </p>

          <p style={{ maxWidth: 820, marginBottom: 0 }}>
            This studio helps students move from a completed poster to a clear, evidence-informed presentation
            with strong answers for professor, peer, and judge feedback.
          </p>
        </div>

        <div className="panelHint" style={{ display: "grid", gap: 12 }}>
          <div className="fieldLabel" style={{ marginBottom: 0 }}>
            <label>Who is currently editing?</label>
            <select value={editor} onChange={(event) => setEditor(event.target.value)}>
              <option value="">Select editor</option>
              {members.map((member) => (
                <option key={member.name} value={member.name}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="actionRow" style={{ justifyContent: "flex-start", gap: 10, flexWrap: "wrap" }}>
            <Link className="button secondaryButton" href="/portfolio">
              Previous Studio
            </Link>

            <Link className="button secondaryButton" href="/dashboard">
              Back to Dashboard
            </Link>

            <button type="button" className="button" onClick={saveProgress}>
              Save Progress
            </button>
          </div>

          {saved ? <div className="savedBanner" style={{ marginTop: 0 }}>{saved}</div> : null}
        </div>
      </section>

      <section className="panelCard" style={{ marginBottom: 22 }}>
        <div className="panelHeader">
          <h3>Final Readiness Score</h3>
          <p className="fieldNote">
            Based on presentation sections, Q&A practice, and checklist completion.
          </p>
        </div>

        <div style={{ height: 12, borderRadius: 999, background: "rgba(15, 23, 42, 0.08)" }}>
          <div
            style={{
              width: `${readinessScore}%`,
              height: "100%",
              borderRadius: 999,
              background: "#0f2f66",
            }}
          />
        </div>

        <p className="fieldNote" style={{ marginTop: 10, marginBottom: 0 }}>
          {readinessScore}% ready · {completedPitch}/{pitchSections.length} presentation sections complete · {answeredQuestions}/{questions.length} questions practiced
        </p>
      </section>

      <div className="stepper" style={{ marginBottom: 18 }}>
        <button
          type="button"
          className={currentTab === "presentation" ? "stepButton active" : "stepButton"}
          onClick={() => setCurrentTab("presentation")}
        >
          1. Presentation Flow
        </button>

        <button
          type="button"
          className={currentTab === "questions" ? "stepButton active" : "stepButton"}
          onClick={() => setCurrentTab("questions")}
        >
          2. Judges Q&A
        </button>

        <button
          type="button"
          className={currentTab === "readiness" ? "stepButton active" : "stepButton"}
          onClick={() => setCurrentTab("readiness")}
        >
          3. Final Readiness
        </button>
      </div>

      {currentTab === "presentation" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 340px",
            gap: 18,
            alignItems: "start",
          }}
        >
          <section className="panelCard">
            <div className="panelHeader">
              <h2>Presentation Flow from Studio Work</h2>
              <p className="fieldNote">
                Each section uses content from previous studios as the basis for the pitch.
              </p>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              {pitchSections.map((section, index) => (
                <div key={section.id} className="panelCard">
                  <div className="panelHeader">
                    <div>
                      <h3 style={{ marginBottom: 4 }}>
                        {index + 1}. {section.title}
                      </h3>
                      <p className="fieldNote" style={{ marginBottom: 0 }}>
                        Source: {section.source}
                      </p>
                    </div>

                    <label className="fieldNote" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="checkbox"
                        checked={section.complete}
                        onChange={() => updatePitchSection(section.id, "complete", !section.complete)}
                        style={{ width: "auto" }}
                      />
                      Ready
                    </label>
                  </div>

                  <div className="panelHint">
                    <strong>Source content from previous studios</strong>
                    <p className="fieldNote" style={{ marginBottom: 0 }}>
                      {section.sourceContent}
                    </p>
                  </div>

                  <div className="panelHint">
                    <strong>Suggested speaking points</strong>
                    <ul style={{ marginBottom: 0 }}>
                      {section.suggestedPoints.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="fieldLabel">
                    <label>Student-edited speaking script</label>
                    <textarea
                      rows={4}
                      value={section.script}
                      onChange={(event) =>
                        updatePitchSection(section.id, "script", event.target.value)
                      }
                      placeholder="Write the exact words or bullet points your speaker will use..."
                    />
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) minmax(160px, 0.5fr)",
                      gap: 12,
                    }}
                  >
                    <div className="fieldLabel">
                      <label>Speaker</label>
                      <select
                        value={section.speaker}
                        onChange={(event) =>
                          updatePitchSection(section.id, "speaker", event.target.value)
                        }
                      >
                        <option value="">Assign speaker</option>
                        {members.map((member) => (
                          <option key={member.name} value={member.name}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="fieldLabel">
                      <label>Timing</label>
                      <input
                        value={section.timing}
                        onChange={(event) =>
                          updatePitchSection(section.id, "timing", event.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside style={{ display: "grid", gap: 16 }}>
            <SidebarPanel title="AI Presentation Coach">
              <p className="fieldNote">
                The coach checks flow, missing sections, timing, weak transitions, and Q&A readiness.
              </p>

              <button type="button" className="button" onClick={runPresentationCoach}>
                Run Presentation Coach
              </button>

              {coachMessage ? <div className="panelHint">{coachMessage}</div> : null}
            </SidebarPanel>

            <SidebarPanel title="Presentation Tips">
              <Tip text="Start with the problem, not the solution." />
              <Tip text="Use evidence briefly; do not overload the audience." />
              <Tip text="Explain why your solution is feasible." />
              <Tip text="Prepare one strong sentence on budget, risk, and sustainability." />
              <Tip text="End with a clear policy recommendation." />
            </SidebarPanel>
          </aside>
        </div>
      ) : null}

      {currentTab === "questions" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 340px",
            gap: 18,
            alignItems: "start",
          }}
        >
          <section className="panelCard">
            <div className="panelHeader">
              <h2>Likely Judges' Questions</h2>
              <p className="fieldNote">
                Practice questions likely to be asked by professors, judges, peers, or policy stakeholders.
              </p>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
              {questions.map((question) => (
                <div key={question.id} className="panelCard">
                  <div className="panelHeader">
                    <div>
                      <h3 style={{ marginBottom: 4 }}>{question.question}</h3>
                      <p className="fieldNote" style={{ marginBottom: 0 }}>
                        {question.difficulty} · {question.theme}
                      </p>
                    </div>
                  </div>

                  <div className="fieldLabel">
                    <label>Student answer</label>
                    <textarea
                      rows={4}
                      value={question.answer}
                      onChange={(event) =>
                        updateQuestion(question.id, "answer", event.target.value)
                      }
                      placeholder="Practice your answer here..."
                    />
                  </div>

                  <button
                    type="button"
                    className="button secondaryButton"
                    onClick={() => generateFeedback(question)}
                  >
                    Get AI Feedback
                  </button>

                  {question.feedback ? (
                    <div className="panelHint" style={{ marginTop: 12 }}>
                      {question.feedback}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <aside style={{ display: "grid", gap: 16 }}>
            <SidebarPanel title="Q&A Strategy">
              <Tip text="Answer directly first, then explain." />
              <Tip text="Use evidence from the poster when possible." />
              <Tip text="If you do not know, acknowledge the limitation and explain how you would find out." />
              <Tip text="Do not defend everything; show learning and reflection." />
              <Tip text="Always connect back to feasibility, equity, and implementation." />
            </SidebarPanel>

            <SidebarPanel title="Question Types">
              <Tip text="Problem: Why this issue?" />
              <Tip text="Evidence: What supports your claim?" />
              <Tip text="Solution: Why this intervention?" />
              <Tip text="Implementation: Who will deliver it?" />
              <Tip text="Budget: Why this cost?" />
              <Tip text="Risk: What could fail?" />
            </SidebarPanel>
          </aside>
        </div>
      ) : null}

      {currentTab === "readiness" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 340px",
            gap: 18,
            alignItems: "start",
          }}
        >
          <section className="panelCard">
            <div className="panelHeader">
              <h2>Final Readiness Checklist</h2>
              <p className="fieldNote">
                Use this before the final presentation or classroom assessment.
              </p>
            </div>

            <div style={{ display: "grid", gap: 10 }}>
              {checklist.map((item) => (
                <label
                  key={item.id}
                  className="panelHint"
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleChecklist(item.id)}
                    style={{ width: "auto" }}
                  />
                  <strong>{item.label}</strong>
                </label>
              ))}
            </div>
          </section>

          <aside style={{ display: "grid", gap: 16 }}>
            <SidebarPanel title="Readiness Summary">
              <div className="panelHint">
                <strong>{readinessScore}% ready</strong>
                <p className="fieldNote" style={{ marginBottom: 0 }}>
                  Keep improving until the team is confident with the pitch and Q&A.
                </p>
              </div>

              <button type="button" className="button" onClick={saveProgress}>
                Save Final Readiness
              </button>
            </SidebarPanel>

            <SidebarPanel title="Final Reminder">
              <Tip text="Know your opening sentence." />
              <Tip text="Do not read the poster word by word." />
              <Tip text="Explain the logic of your policy." />
              <Tip text="Use the poster as support, not as a script." />
              <Tip text="End with a confident recommendation." />
            </SidebarPanel>
          </aside>
        </div>
      ) : null}
    </main>
  );
}

function SidebarPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="panelCard">
      <div className="panelHeader">
        <h3>{title}</h3>
      </div>

      <div style={{ display: "grid", gap: 12 }}>{children}</div>
    </div>
  );
}

function Tip({ text }: { text: string }) {
  return (
    <div className="panelHint">
      <span className="fieldNote" style={{ marginBottom: 0 }}>
        {text}
      </span>
    </div>
  );
}
