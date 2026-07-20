"use client";

import { useMemo, useState } from "react";

type IconGroup = {
  name: string;
  icons: string[];
};

const iconGroups: IconGroup[] = [
  {
    name: "Health",
    icons: ["🏥", "🩺", "💊", "🧬", "🧠", "❤️", "🧑‍⚕️", "🚑"],
  },
  {
    name: "Education",
    icons: ["🎓", "📚", "🧑‍🏫", "✏️", "🏫", "🧪", "📝", "💡"],
  },
  {
    name: "People & Community",
    icons: ["👤", "👥", "👨‍👩‍👧", "🤝", "👶", "🧑‍🦽", "🏘️", "🫂"],
  },
  {
    name: "Government & Policy",
    icons: ["🏛️", "📜", "⚖️", "🗳️", "📌", "🧭", "📋", "🖋️"],
  },
  {
    name: "Evidence & Data",
    icons: ["📊", "📈", "📉", "🧾", "🔎", "🗂️", "📑", "📌"],
  },
  {
    name: "Risk & Safety",
    icons: ["⚠️", "🚧", "🔥", "🛡️", "❗", "🧯", "🚨", "🔒"],
  },
  {
    name: "Digital & AI",
    icons: ["💻", "📱", "🤖", "🌐", "🔐", "📡", "🧠", "⚙️"],
  },
  {
    name: "Environment",
    icons: ["🌱", "🌍", "💧", "☀️", "♻️", "🌳", "🌬️", "⚡"],
  },
  {
    name: "Transport & Mobility",
    icons: ["🚌", "🚗", "🚦", "🚲", "🛣️", "🚶", "🚇", "✈️"],
  },
  {
    name: "Finance & Resources",
    icons: ["💰", "💵", "🏦", "📦", "🧮", "📊", "🧾", "🔁"],
  },
];

export default function IconLibrary({
  onAddIcon,
}: {
  onAddIcon: (icon: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [activeGroup, setActiveGroup] = useState("Health");
  const [search, setSearch] = useState("");

  const filteredGroups = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return iconGroups;

    return iconGroups.filter((group) =>
      group.name.toLowerCase().includes(term)
    );
  }, [search]);

  const group =
    filteredGroups.find((item) => item.name === activeGroup) ??
    filteredGroups[0] ??
    iconGroups[0];

  return (
    <div className="panelHint">
      <button
        type="button"
        className="button secondaryButton"
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        {open ? "Hide Icon Library" : "Open Icon Library"}
        <span>{open ? "▴" : "▾"}</span>
      </button>

      {open ? (
        <div style={{ display: "grid", gap: 10, marginTop: 10 }}>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search category..."
          />

          <select
            value={group.name}
            onChange={(event) => setActiveGroup(event.target.value)}
          >
            {filteredGroups.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 8,
            }}
          >
            {group.icons.map((icon, index) => (
              <button
                key={`${group.name}-${icon}-${index}`}
                type="button"
                onClick={() => onAddIcon(icon)}
                className="panelHint"
                style={{
                  width: "100%",
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

          <p className="fieldNote" style={{ marginBottom: 0 }}>
            Click an icon to insert it at the last cursor position in a workspace card.
          </p>
        </div>
      ) : null}
    </div>
  );
}
