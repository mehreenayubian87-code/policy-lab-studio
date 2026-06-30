"use client";

import { useMemo, useState } from "react";

const iconGroups = [
  { name: "Health", icons: ["🏥", "🩺", "💊", "🧬", "🧠", "❤️"] },
  { name: "People", icons: ["👤", "👥", "👩‍👧", "🧑‍🏫", "👨‍👩‍👧", "🤝"] },
  { name: "Government", icons: ["🏛️", "📜", "⚖️", "🗳️", "📌", "🧭"] },
  { name: "Data", icons: ["📊", "📈", "📉", "🧾", "🔎", "🗂️"] },
  { name: "Risk", icons: ["⚠️", "🚧", "🔥", "🛡️", "❗", "🧯"] },
  { name: "Digital", icons: ["💻", "📱", "🤖", "🌐", "🔐", "📡"] },
  { name: "Environment", icons: ["🌱", "🌍", "💧", "☀️", "♻️", "🌳"] },
  { name: "Transport", icons: ["🚌", "🚗", "🚦", "🚲", "🛣️", "🚶"] },
];

export default function IconLibrary({
  onAddIcon,
}: {
  onAddIcon: (icon: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filteredGroups = useMemo(() => {
    if (!query.trim()) return iconGroups;

    const q = query.toLowerCase();

    return iconGroups
      .map((group) => ({
        ...group,
        icons: group.icons.filter(
          (icon) => group.name.toLowerCase().includes(q) || icon.includes(query)
        ),
      }))
      .filter((group) => group.icons.length > 0 || group.name.toLowerCase().includes(q));
  }, [query]);

  return (
    <div className="panelHint">
      <button
        type="button"
        className="button secondaryButton"
        onClick={() => setOpen((prev) => !prev)}
        style={{ width: "100%", justifyContent: "space-between" }}
      >
        {open ? "Hide Icon Library" : "Open Icon Library"}
        <span>{open ? "▴" : "▾"}</span>
      </button>

      {open ? (
        <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search icon category..."
          />

          {filteredGroups.map((group) => (
            <details key={group.name} open={group.name === "Health"}>
              <summary
                style={{
                  cursor: "pointer",
                  fontWeight: 800,
                  color: "#0f2f66",
                  marginBottom: 8,
                }}
              >
                {group.name}
              </summary>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {group.icons.map((icon) => (
                  <button
                    key={`${group.name}-${icon}`}
                    type="button"
                    onClick={() => onAddIcon(icon)}
                    className="panelHint"
                    style={{
                      width: 42,
                      height: 42,
                      display: "grid",
                      placeItems: "center",
                      fontSize: "1.2rem",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </details>
          ))}
        </div>
      ) : null}
    </div>
  );
}
