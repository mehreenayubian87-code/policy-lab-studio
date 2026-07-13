"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  type ProjectStudent,
  useProject,
} from "@/components/ProjectState/ProjectProvider";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function TeamSetupPage() {
  const { project, updateSetup } = useProject();
  const {
    groupNumber,
    courseName,
    professorName,
    professorEmail,
    policyIssue,
    students,
    teamLead,
  } = project.setup;

  const completedStudents = useMemo(
    () =>
      students.filter(
        (student) =>
          student.name.trim() &&
          emailPattern.test(student.email.trim())
      ).length,
    [students]
  );

  const professorEmailValid =
    !professorEmail.trim() ||
    emailPattern.test(professorEmail.trim());

  const studentEmailsValid = students.every(
    (student) =>
      !student.email.trim() ||
      emailPattern.test(student.email.trim())
  );

  const teamLeadMatchesStudent = students.some(
    (student) =>
      student.name.trim().toLowerCase() ===
      teamLead.trim().toLowerCase()
  );

  const canContinue =
    groupNumber.trim() &&
    courseName.trim() &&
    professorName.trim() &&
    professorEmail.trim() &&
    professorEmailValid &&
    policyIssue.trim() &&
    teamLead.trim() &&
    teamLeadMatchesStudent &&
    completedStudents >= 2 &&
    studentEmailsValid;

  const updateStudent = (
    index: number,
    key: keyof ProjectStudent,
    value: string
  ) => {
    const updatedStudents = students.map((student, studentIndex) =>
      studentIndex === index
        ? { ...student, [key]: value }
        : student
    );

    updateSetup({ students: updatedStudents });
  };

  return (
    <main className="page">
      <section
        className="panelCard"
        style={{
          padding: 32,
          marginBottom: 20,
          display: "grid",
          gap: 10,
        }}
      >
        <div className="fieldNote" style={{ fontWeight: 800 }}>
          POLICY LAB STUDIO
        </div>

        <h1 style={{ marginBottom: 4 }}>Team Setup</h1>

        <p className="hero-subtitle" style={{ marginBottom: 0 }}>
          Add the basic project and team information before continuing.
        </p>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: 18,
        }}
      >
        <div className="panelCard">
          <div className="panelHeader">
            <h2>Project Information</h2>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 16,
            }}
          >
            <label className="fieldLabel">
              <span>Group number</span>
              <input
                value={groupNumber}
                onChange={(event) =>
                  updateSetup({ groupNumber: event.target.value })
                }
                placeholder="e.g. 1"
              />
            </label>

            <label className="fieldLabel">
              <span>Course / session</span>
              <input
                value={courseName}
                onChange={(event) =>
                  updateSetup({ courseName: event.target.value })
                }
                placeholder="e.g. MGHP Policy Lab"
              />
            </label>

            <label className="fieldLabel">
              <span>Professor name</span>
              <input
                value={professorName}
                onChange={(event) =>
                  updateSetup({ professorName: event.target.value })
                }
                placeholder="e.g. Dr. ..."
              />
            </label>

            <label className="fieldLabel">
              <span>Professor email</span>
              <input
                type="email"
                value={professorEmail}
                onChange={(event) =>
                  updateSetup({ professorEmail: event.target.value })
                }
                placeholder="professor@university.edu"
              />

              {!professorEmailValid ? (
                <small style={{ color: "#b91c1c", fontWeight: 700 }}>
                  Enter a valid professor email.
                </small>
              ) : null}
            </label>

            <label
              className="fieldLabel"
              style={{ gridColumn: "1 / -1" }}
            >
              <span>Policy issue</span>
              <input
                value={policyIssue}
                onChange={(event) =>
                  updateSetup({ policyIssue: event.target.value })
                }
                placeholder="e.g. Access to mental health services"
              />
            </label>
          </div>
        </div>

        <div className="panelCard">
          <div className="panelHeader">
            <h2>Team Members</h2>
            <p className="fieldNote">
              Enter at least two student names and emails.
            </p>
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {students.map((student, index) => {
              const emailValid =
                !student.email.trim() ||
                emailPattern.test(student.email.trim());

              return (
                <div
                  key={index}
                  className="panelHint"
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "minmax(0, 1fr) minmax(0, 1fr)",
                    gap: 12,
                    alignItems: "start",
                  }}
                >
                  <label className="fieldLabel">
                    <span>Student {index + 1} name</span>
                    <input
                      value={student.name}
                      onChange={(event) =>
                        updateStudent(index, "name", event.target.value)
                      }
                      placeholder={`Student ${index + 1} name`}
                    />
                  </label>

                  <label className="fieldLabel">
                    <span>Student {index + 1} email</span>
                    <input
                      type="email"
                      value={student.email}
                      onChange={(event) =>
                        updateStudent(index, "email", event.target.value)
                      }
                      placeholder="student@university.edu"
                    />

                    {!emailValid ? (
                      <small
                        style={{
                          color: "#b91c1c",
                          fontWeight: 700,
                        }}
                      >
                        Enter a valid student email.
                      </small>
                    ) : null}
                  </label>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panelCard">
          <div className="panelHeader">
            <h2>Team Lead</h2>
          </div>

          <label className="fieldLabel">
            <span>Team lead name</span>
            <input
              value={teamLead}
              onChange={(event) =>
                updateSetup({ teamLead: event.target.value })
              }
              placeholder="Enter one of the student names listed above"
            />

            {teamLead.trim() && !teamLeadMatchesStudent ? (
              <small style={{ color: "#b91c1c", fontWeight: 700 }}>
                Team lead must match one of the student names above.
              </small>
            ) : null}
          </label>
        </div>

        <div
          className="panelCard"
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Link href="/overview" className="button secondaryButton">
            Back to Overview
          </Link>

          {canContinue ? (
            <Link href="/resource-hub" className="button">
              Continue to Resource Hub
            </Link>
          ) : (
            <button type="button" className="button" disabled>
              Complete required fields
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
