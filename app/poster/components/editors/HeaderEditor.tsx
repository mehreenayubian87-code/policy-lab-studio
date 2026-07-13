"use client";

import type { EditorProps } from "./editorTypes";

export default function HeaderEditor({
  posterHeader,
  updateHeader,
}: EditorProps) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <label className="fieldLabel">
        <span>Logo / Icon</span>
        <input
          value={posterHeader.logo}
          onChange={(event) => updateHeader({ logo: event.target.value })}
        />
      </label>

      <label className="fieldLabel">
        <span>Poster Title</span>
        <textarea
          rows={3}
          value={posterHeader.title}
          onChange={(event) => updateHeader({ title: event.target.value })}
        />
      </label>

      <label className="fieldLabel">
        <span>Subtitle</span>
        <textarea
          rows={4}
          value={posterHeader.subtitle}
          onChange={(event) => updateHeader({ subtitle: event.target.value })}
        />
      </label>

      <label className="fieldLabel">
        <span>Team</span>
        <input
          value={posterHeader.team}
          onChange={(event) => updateHeader({ team: event.target.value })}
        />
      </label>

      <label className="fieldLabel">
        <span>Course</span>
        <input
          value={posterHeader.course}
          onChange={(event) => updateHeader({ course: event.target.value })}
        />
      </label>

      <label className="fieldLabel">
        <span>Instructor</span>
        <input
          value={posterHeader.instructor}
          onChange={(event) => updateHeader({ instructor: event.target.value })}
        />
      </label>
    </div>
  );
}