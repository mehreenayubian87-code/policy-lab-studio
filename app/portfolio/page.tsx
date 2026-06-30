"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Poster = {
  id: string;
  title: string;
  category: string;
  theme: string;
  year: string;
  team: string;
  course: string;
  summary: string;
  keywords: string[];
  thumbnailLabel: string;
  status?: string;
};

const categories = [
  "All",
  "Health Policy",
  "Education & Learning",
  "Inclusion, Family & Community Wellbeing",
  "Sustainability & Environment",
  "Mobility, Safety & Public Services",
  "Digital Awareness & Public Engagement",
];

const posters: Poster[] = [
  {
    id: "eduactive",
    title: "EduActive+",
    category: "Education & Learning",
    theme: "Active learning",
    year: "2026",
    team: "Student Team",
    course: "Policy Lab",
    summary:
      "A policy proposal focused on improving student engagement through active and experiential learning.",
    keywords: ["Education", "Learning", "Engagement"],
    thumbnailLabel: "EduActive+",
    status: "Featured",
  },
  {
    id: "actilearn",
    title: "ACTILEARN",
    category: "Education & Learning",
    theme: "Learning innovation",
    year: "2026",
    team: "Student Team",
    course: "Policy Lab",
    summary:
      "A learning-centered poster exploring active participation, skills development, and educational outcomes.",
    keywords: ["Education", "Skills", "Participation"],
    thumbnailLabel: "ACTILEARN",
  },
  {
    id: "oufoq",
    title: "OUFOQ",
    category: "Education & Learning",
    theme: "Future learning",
    year: "2026",
    team: "Student Team",
    course: "Policy Lab",
    summary:
      "A poster focused on educational pathways, student growth, and future-oriented learning support.",
    keywords: ["Education", "Future", "Students"],
    thumbnailLabel: "OUFOQ",
  },
  {
    id: "translation",
    title: "Lost in Translation",
    category: "Education & Learning",
    theme: "Communication and language",
    year: "2026",
    team: "Student Team",
    course: "Policy Lab",
    summary:
      "A policy poster addressing communication gaps and language-related barriers in learning environments.",
    keywords: ["Language", "Communication", "Education"],
    thumbnailLabel: "Lost in Translation",
  },
  {
    id: "teacher-taskforce",
    title: "Empowering Teacher Task Force",
    category: "Education & Learning",
    theme: "Teacher support",
    year: "2026",
    team: "Student Team",
    course: "Policy Lab",
    summary:
      "A poster exploring how teachers can be supported, empowered, and integrated into reform processes.",
    keywords: ["Teachers", "Education", "Workforce"],
    thumbnailLabel: "Teacher Task Force",
  },
  {
    id: "harmony-haven",
    title: "Harmony Haven",
    category: "Inclusion, Family & Community Wellbeing",
    theme: "Community wellbeing",
    year: "2026",
    team: "Student Team",
    course: "Policy Lab",
    summary:
      "A community-focused poster addressing social connection, wellbeing, and inclusive support.",
    keywords: ["Community", "Wellbeing", "Inclusion"],
    thumbnailLabel: "Harmony Haven",
    status: "Faculty Pick",
  },
  {
    id: "nahtam",
    title: "Project Nahtam: Autism Acceptance",
    category: "Inclusion, Family & Community Wellbeing",
    theme: "Autism acceptance",
    year: "2026",
    team: "Student Team",
    course: "Policy Lab",
    summary:
      "A poster promoting autism acceptance, inclusive services, and family-centered community awareness.",
    keywords: ["Autism", "Inclusion", "Family"],
    thumbnailLabel: "Project Nahtam",
  },
  {
    id: "taqdir",
    title: "TAQDIR",
    category: "Inclusion, Family & Community Wellbeing",
    theme: "Recognition and support",
    year: "2026",
    team: "Student Team",
    course: "Policy Lab",
    summary:
      "A policy idea centered on recognition, dignity, and support for community members.",
    keywords: ["Support", "Community", "Recognition"],
    thumbnailLabel: "TAQDIR",
  },
  {
    id: "mawada",
    title: "MAWADA",
    category: "Inclusion, Family & Community Wellbeing",
    theme: "Family wellbeing",
    year: "2026",
    team: "Student Team",
    course: "Policy Lab",
    summary:
      "A poster focused on strengthening family wellbeing, social support, and community care.",
    keywords: ["Family", "Care", "Wellbeing"],
    thumbnailLabel: "MAWADA",
  },
  {
    id: "ehtewaa",
    title: "EHTEWAA",
    category: "Inclusion, Family & Community Wellbeing",
    theme: "Inclusion",
    year: "2026",
    team: "Student Team",
    course: "Policy Lab",
    summary:
      "An inclusion-oriented poster addressing belonging, access, and responsive community support.",
    keywords: ["Inclusion", "Access", "Community"],
    thumbnailLabel: "EHTEWAA",
  },
  {
    id: "mawjat",
    title: "Mawjat Al-Tamkeen",
    category: "Inclusion, Family & Community Wellbeing",
    theme: "Empowerment",
    year: "2026",
    team: "Student Team",
    course: "Policy Lab",
    summary:
      "A policy poster exploring empowerment, participation, and community-driven support.",
    keywords: ["Empowerment", "Participation", "Community"],
    thumbnailLabel: "Mawjat Al-Tamkeen",
  },
  {
    id: "taph2o",
    title: "TAPH2O '25",
    category: "Sustainability & Environment",
    theme: "Water sustainability",
    year: "2026",
    team: "Student Team",
    course: "Policy Lab",
    summary:
      "A sustainability poster focused on water use, conservation, and public engagement.",
    keywords: ["Water", "Sustainability", "Environment"],
    thumbnailLabel: "TAPH2O '25",
  },
  {
    id: "fuel-future",
    title: "Fuel of the Future",
    category: "Sustainability & Environment",
    theme: "Energy transition",
    year: "2026",
    team: "Student Team",
    course: "Policy Lab",
    summary:
      "A poster exploring future energy solutions and sustainability-oriented policy options.",
    keywords: ["Energy", "Sustainability", "Future"],
    thumbnailLabel: "Fuel of the Future",
  },
  {
    id: "shopping",
    title: "Sustainable Shopping in Qatar",
    category: "Sustainability & Environment",
    theme: "Consumer behavior",
    year: "2026",
    team: "Student Team",
    course: "Policy Lab",
    summary:
      "A poster addressing sustainable consumption, shopping behaviors, and environmental awareness.",
    keywords: ["Sustainability", "Consumption", "Qatar"],
    thumbnailLabel: "Sustainable Shopping",
  },
  {
    id: "wajheti",
    title: "Wajheti",
    category: "Mobility, Safety & Public Services",
    theme: "Mobility",
    year: "2026",
    team: "Student Team",
    course: "Policy Lab",
    summary:
      "A public service poster focused on navigation, mobility, and user-centered access.",
    keywords: ["Mobility", "Public Services", "Access"],
    thumbnailLabel: "Wajheti",
  },
  {
    id: "road-safety",
    title: "Beyond the Basics: Road Safety in Qatar",
    category: "Mobility, Safety & Public Services",
    theme: "Road safety",
    year: "2026",
    team: "Student Team",
    course: "Policy Lab",
    summary:
      "A safety-focused poster addressing road behavior, prevention, and public awareness.",
    keywords: ["Road Safety", "Mobility", "Prevention"],
    thumbnailLabel: "Road Safety",
  },
  {
    id: "thqa",
    title: "THQA",
    category: "Digital Awareness & Public Engagement",
    theme: "Digital trust",
    year: "2026",
    team: "Student Team",
    course: "Policy Lab",
    summary:
      "A poster focused on trust, awareness, and responsible digital engagement.",
    keywords: ["Digital", "Trust", "Awareness"],
    thumbnailLabel: "THQA",
  },
  {
    id: "awareness",
    title: "Awareness",
    category: "Digital Awareness & Public Engagement",
    theme: "Public engagement",
    year: "2026",
    team: "Student Team",
    course: "Policy Lab",
    summary:
      "A public awareness poster designed to inform, engage, and encourage action.",
    keywords: ["Awareness", "Public Engagement", "Communication"],
    thumbnailLabel: "Awareness",
  },
];

export default function PolicyPortfolio() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedPoster, setSelectedPoster] = useState<Poster | null>(posters[0]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [viewerPoster, setViewerPoster] = useState<Poster | null>(null);

  const filteredPosters = useMemo(() => {
    return posters.filter((poster) => {
      const matchesCategory =
        selectedCategory === "All" || poster.category === selectedCategory;
      const searchText = `${poster.title} ${poster.category} ${poster.theme} ${poster.summary} ${poster.keywords.join(
        " "
      )}`.toLowerCase();
      return matchesCategory && searchText.includes(search.toLowerCase());
    });
  }, [selectedCategory, search]);

  const groupedPosters = useMemo(() => {
    return categories
      .filter((category) => category !== "All")
      .map((category) => ({
        category,
        items: filteredPosters.filter((poster) => poster.category === category),
      }))
      .filter((group) => group.items.length > 0);
  }, [filteredPosters]);

  const toggleSaved = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const openViewer = (poster: Poster) => {
    setSelectedPoster(poster);
    setViewerPoster(poster);
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
          <h1 style={{ marginBottom: 8 }}>Policy Portfolio</h1>

          <h2
            style={{
              fontSize: "1.6rem",
              fontWeight: 600,
              color: "#42526b",
              marginBottom: 14,
              lineHeight: 1.25,
            }}
          >
            Explore previous policy posters
          </h2>

          <p className="hero-subtitle" style={{ marginBottom: 10 }}>
            A gallery of student policy projects for inspiration, design ideas, and topic exploration.
          </p>

          <p style={{ maxWidth: 820, marginBottom: 0 }}>
            Browse previous posters by category, view poster summaries, save examples as inspiration,
            and use the gallery before building your own final poster.
          </p>
        </div>

        <div className="panelHint" style={{ display: "grid", gap: 12 }}>
          <strong>Gallery purpose</strong>
          <p className="fieldNote" style={{ margin: 0 }}>
            This page is for inspiration only. Students should learn from previous poster styles and topics,
            not copy their content.
          </p>

          <div className="actionRow" style={{ justifyContent: "flex-start", gap: 10, flexWrap: "wrap" }}>
            <Link className="button secondaryButton" href="/poster">
              Back to Poster Studio
            </Link>

            <Link className="button secondaryButton" href="/dashboard">
              Back to Dashboard
            </Link>

            <Link className="button" href="/presentation">
  Next: Presentation Studio
</Link>
          </div>
        </div>
      </section>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px minmax(0, 1fr) 340px",
          gap: 18,
          alignItems: "start",
        }}
      >
        <aside className="panelCard" style={{ position: "sticky", top: 18 }}>
          <div className="panelHeader">
            <h3>Browse Gallery</h3>
            <p className="fieldNote">Filter by category or search by topic.</p>
          </div>

          <div className="fieldLabel">
            <label>Search posters</label>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, theme, keyword..."
            />
          </div>

          <div style={{ display: "grid", gap: 8 }}>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className="panelHint"
                style={{
                  textAlign: "left",
                  cursor: "pointer",
                  border:
                    selectedCategory === category
                      ? "2px solid #0f2f66"
                      : "1px solid rgba(15, 23, 42, 0.08)",
                  color: selectedCategory === category ? "#0f2f66" : "inherit",
                  fontWeight: selectedCategory === category ? 800 : 600,
                }}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="panelHint" style={{ marginTop: 14 }}>
            <strong>Saved Inspiration</strong>
            <p className="fieldNote" style={{ marginBottom: 0 }}>
              {savedIds.length} poster{savedIds.length === 1 ? "" : "s"} saved.
            </p>
          </div>
        </aside>

        <section className="panelCard">
          <div className="panelHeader">
            <h2>Poster Gallery</h2>
            <p className="fieldNote">
              {filteredPosters.length} poster{filteredPosters.length === 1 ? "" : "s"} found.
            </p>
          </div>

          {filteredPosters.length === 0 ? (
            <div className="panelHint">No posters found. Try another search term or category.</div>
          ) : selectedCategory === "All" ? (
            <div style={{ display: "grid", gap: 24 }}>
              {groupedPosters.map((group) => (
                <div key={group.category}>
                  <div className="panelHeader">
                    <h3>{group.category}</h3>
                    <p className="fieldNote">
                      {group.items.length} poster{group.items.length === 1 ? "" : "s"}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 16,
                    }}
                  >
                    {group.items.map((poster) => (
                      <PosterCard
                        key={poster.id}
                        poster={poster}
                        selected={selectedPoster?.id === poster.id}
                        saved={savedIds.includes(poster.id)}
                        onSelect={() => setSelectedPoster(poster)}
                        onView={() => openViewer(poster)}
                        onSave={() => toggleSaved(poster.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: 16,
              }}
            >
              {filteredPosters.map((poster) => (
                <PosterCard
                  key={poster.id}
                  poster={poster}
                  selected={selectedPoster?.id === poster.id}
                  saved={savedIds.includes(poster.id)}
                  onSelect={() => setSelectedPoster(poster)}
                  onView={() => openViewer(poster)}
                  onSave={() => toggleSaved(poster.id)}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="panelCard" style={{ position: "sticky", top: 18 }}>
          <div className="panelHeader">
            <h3>Poster Details</h3>
            <p className="fieldNote">Select a poster to preview details.</p>
          </div>

          {selectedPoster ? (
            <div style={{ display: "grid", gap: 12 }}>
              <div
                className="panelHint"
                style={{
                  minHeight: 220,
                  display: "grid",
                  placeItems: "center",
                  textAlign: "center",
                  background:
                    "linear-gradient(135deg, rgba(15,47,102,0.08), rgba(255,255,255,0.92))",
                  border: "1px solid rgba(15,47,102,0.14)",
                }}
              >
                <div>
                  <div style={{ fontSize: "2rem", marginBottom: 8 }}>🖼️</div>
                  <strong>{selectedPoster.thumbnailLabel}</strong>
                  <p className="fieldNote" style={{ marginBottom: 0 }}>
                    Poster preview placeholder
                  </p>
                </div>
              </div>

              <div>
                <h2 style={{ marginBottom: 6 }}>{selectedPoster.title}</h2>
                <p className="fieldNote" style={{ marginBottom: 0 }}>
                  {selectedPoster.category}
                </p>
              </div>

              <div className="panelHint">
                <strong>Summary</strong>
                <p className="fieldNote" style={{ marginBottom: 0 }}>
                  {selectedPoster.summary}
                </p>
              </div>

              <div className="panelHint">
                <strong>Details</strong>
                <p className="fieldNote" style={{ marginBottom: 4 }}>
                  Theme: {selectedPoster.theme}
                </p>
                <p className="fieldNote" style={{ marginBottom: 4 }}>
                  Course: {selectedPoster.course}
                </p>
                <p className="fieldNote" style={{ marginBottom: 4 }}>
                  Year: {selectedPoster.year}
                </p>
                <p className="fieldNote" style={{ marginBottom: 0 }}>
                  Team: {selectedPoster.team}
                </p>
              </div>

              <div className="panelHint">
                <strong>Keywords</strong>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
                  {selectedPoster.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="panelHint"
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        fontWeight: 700,
                        color: "#0f2f66",
                      }}
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="actionRow" style={{ justifyContent: "flex-start", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="button"
                  onClick={() => toggleSaved(selectedPoster.id)}
                >
                  {savedIds.includes(selectedPoster.id) ? "Saved ✓" : "Save Inspiration"}
                </button>

                <button
                  type="button"
                  className="button secondaryButton"
                  onClick={() => openViewer(selectedPoster)}
                >
                  View Poster
                </button>
              </div>
            </div>
          ) : (
            <div className="panelHint">No poster selected.</div>
          )}
        </aside>
      </div>

      {viewerPoster ? (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(15, 23, 42, 0.72)",
            display: "grid",
            placeItems: "center",
            padding: 24,
          }}
        >
          <div
            className="panelCard"
            style={{
              width: "min(980px, 96vw)",
              maxHeight: "90vh",
              overflow: "auto",
              padding: 24,
            }}
          >
            <div className="actionRow" style={{ justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
              <div>
                <h2 style={{ marginBottom: 4 }}>{viewerPoster.title}</h2>
                <p className="fieldNote" style={{ marginBottom: 0 }}>
                  {viewerPoster.category} · {viewerPoster.year}
                </p>
              </div>

              <button
                type="button"
                className="button secondaryButton"
                onClick={() => setViewerPoster(null)}
              >
                Close ×
              </button>
            </div>

            <div
              className="panelHint"
              style={{
                minHeight: 560,
                display: "grid",
                placeItems: "center",
                textAlign: "center",
                background:
                  "linear-gradient(135deg, rgba(15,47,102,0.08), rgba(255,255,255,0.96))",
                border: "1px solid rgba(15,47,102,0.14)",
              }}
            >
              <div>
                <div style={{ fontSize: "4rem", marginBottom: 12 }}>🖼️</div>
                <h2>{viewerPoster.thumbnailLabel}</h2>
                <p className="fieldNote">
                  Full poster image will appear here after the poster files are added.
                </p>
              </div>
            </div>

            <div className="panelHint" style={{ marginTop: 14 }}>
              <strong>Summary</strong>
              <p className="fieldNote" style={{ marginBottom: 0 }}>{viewerPoster.summary}</p>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}

function PosterCard({
  poster,
  selected,
  saved,
  onSelect,
  onView,
  onSave,
}: {
  poster: Poster;
  selected: boolean;
  saved: boolean;
  onSelect: () => void;
  onView: () => void;
  onSave: () => void;
}) {
  return (
    <article
      className="panelCard"
      style={{
        padding: 14,
        display: "grid",
        gap: 10,
        border: selected ? "2px solid #0f2f66" : "1px solid rgba(15, 23, 42, 0.08)",
        cursor: "pointer",
      }}
      onClick={onSelect}
    >
      <div
        className="panelHint"
        style={{
          minHeight: 170,
          display: "grid",
          placeItems: "center",
          textAlign: "center",
          background:
            "linear-gradient(135deg, rgba(15,47,102,0.08), rgba(255,255,255,0.92))",
        }}
      >
        <div>
          <div style={{ fontSize: "1.8rem", marginBottom: 6 }}>🖼️</div>
          <strong>{poster.thumbnailLabel}</strong>
          {poster.status ? (
            <p className="fieldNote" style={{ marginBottom: 0, marginTop: 6 }}>
              {poster.status}
            </p>
          ) : null}
        </div>
      </div>

      <div>
        <h3 style={{ marginBottom: 6 }}>{poster.title}</h3>
        <p className="fieldNote" style={{ marginBottom: 8 }}>
          {poster.summary}
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span className="panelHint" style={{ padding: "6px 10px", borderRadius: 999, fontWeight: 700 }}>
          {poster.theme}
        </span>
        <span className="panelHint" style={{ padding: "6px 10px", borderRadius: 999, fontWeight: 700 }}>
          {poster.year}
        </span>
      </div>

      <div className="actionRow" style={{ justifyContent: "space-between", gap: 8 }}>
        <button
          type="button"
          className="button secondaryButton"
          onClick={(event) => {
            event.stopPropagation();
            onView();
          }}
        >
          View
        </button>

        <button
          type="button"
          className="button secondaryButton"
          onClick={(event) => {
            event.stopPropagation();
            onSave();
          }}
        >
          {saved ? "Saved ✓" : "☆ Save"}
        </button>
      </div>
    </article>
  );
}
