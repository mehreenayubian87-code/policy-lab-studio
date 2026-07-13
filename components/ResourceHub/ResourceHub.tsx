"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "./ResourceHub.module.css";
import { resourceLibrary } from "./resourceLibrary";

type ResourceItem = (typeof resourceLibrary)[number];

const STORAGE_KEY = "plstudio_resource_hub_v1";

const studioTabs = [
  "All Resources",
  "Problem Studio",
  "Process Studio",
  "Solution Studio",
  "Implementation Studio",
  "Poster Studio",
  "Presentation Studio",
  "Templates / Tools",
  "Favorites",
];

export default function ResourceHub() {
  const [activeStudio, setActiveStudio] = useState("All Resources");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [selectedId, setSelectedId] = useState(resourceLibrary[0]?.id ?? "");
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setCompleted(parsed.completed || {});
      setFavorites(parsed.favorites || {});
      setNotes(parsed.notes || {});
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        completed,
        favorites,
        notes,
      })
    );
  }, [completed, favorites, notes]);

  const resourceTypes = useMemo(() => {
    return [
      "All Types",
      ...Array.from(new Set(resourceLibrary.map((resource) => resource.type))),
    ];
  }, []);

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();

    return resourceLibrary.filter((resource) => {
      const matchesStudio =
        activeStudio === "All Resources" ||
        activeStudio === "Favorites" ||
        resource.studios.includes(activeStudio) ||
        resource.category === activeStudio;

      const matchesFavorites =
        activeStudio !== "Favorites" || Boolean(favorites[resource.id]);

      const matchesType =
        typeFilter === "All Types" || resource.type === typeFilter;

      const searchableText = [
        resource.title,
        resource.description,
        resource.category,
        resource.type,
        resource.difficulty,
        ...(resource.studios || []),
        ...(resource.tags || []),
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      return matchesStudio && matchesFavorites && matchesType && matchesSearch;
    });
  }, [activeStudio, favorites, search, typeFilter]);

  const selectedResource =
    resourceLibrary.find((resource) => resource.id === selectedId) ||
    filteredResources[0] ||
    resourceLibrary[0];

  const completedCount = resourceLibrary.filter(
    (resource) => completed[resource.id]
  ).length;

  const favoriteCount = resourceLibrary.filter(
    (resource) => favorites[resource.id]
  ).length;

  const updateNote = (id: string, value: string) => {
    setNotes((prev) => ({ ...prev, [id]: value }));
  };

  const toggleCompleted = (id: string) => {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main className="page">
      <section className={styles.header}>
        <div>
          <div className={styles.kicker}>POLICY LAB STUDIO</div>
          <h1>Resource Hub</h1>
          <p>
            Curated readings, templates, frameworks, and examples for each stage
            of the policy lab workflow.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link href="/dashboard" className="button secondaryButton">
            Go to Dashboard
          </Link>
          <Link href="/" className="button secondaryButton">
            Home
          </Link>
        </div>
      </section>

      <section className={styles.statsRow}>
        <div className={styles.statCard}>
          <strong>{resourceLibrary.length}</strong>
          <span>Total resources</span>
        </div>

        <div className={styles.statCard}>
          <strong>{completedCount}</strong>
          <span>Completed</span>
        </div>

        <div className={styles.statCard}>
          <strong>{favoriteCount}</strong>
          <span>Favorites</span>
        </div>

        <div className={styles.statCard}>
          <strong>{filteredResources.length}</strong>
          <span>Current view</span>
        </div>
      </section>

      <section className={styles.filters}>
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search resources, frameworks, studios, or tags..."
        />

        <select
          value={typeFilter}
          onChange={(event) => setTypeFilter(event.target.value)}
        >
          {resourceTypes.map((type) => (
            <option key={type}>{type}</option>
          ))}
        </select>
      </section>

      <section className={styles.hubShell}>
        <aside className={styles.leftPanel}>
          {studioTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`${styles.tabButton} ${
                activeStudio === tab ? styles.tabButtonActive : ""
              }`}
              onClick={() => setActiveStudio(tab)}
            >
              {tab}
            </button>
          ))}
        </aside>

        <section className={styles.resourceList}>
          {filteredResources.length === 0 ? (
            <div className={styles.emptyState}>
              No resources match this filter.
            </div>
          ) : (
            filteredResources.map((resource) => (
              <article
                key={resource.id}
                className={`${styles.resourceCard} ${
                  selectedResource?.id === resource.id
                    ? styles.resourceCardActive
                    : ""
                }`}
                onClick={() => setSelectedId(resource.id)}
              >
                <div className={styles.cardTop}>
                  <span className={styles.badge}>{resource.type}</span>
                  <span className={styles.badgeLight}>
                    {resource.difficulty}
                  </span>
                </div>

                <h3>{resource.title}</h3>
                <p>{resource.description}</p>

                <div className={styles.metaLine}>
                  <span>{resource.category}</span>
                  <span>{resource.studios.join(" · ")}</span>
                </div>

                <div className={styles.cardActions}>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className="button secondaryButton"
                    onClick={(event) => event.stopPropagation()}
                  >
                    Open
                  </a>

                  <button
                    type="button"
                    className="button secondaryButton"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleFavorite(resource.id);
                    }}
                  >
                    {favorites[resource.id] ? "★ Saved" : "☆ Favorite"}
                  </button>

                  <button
                    type="button"
                    className="button secondaryButton"
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleCompleted(resource.id);
                    }}
                  >
                    {completed[resource.id] ? "✓ Completed" : "Mark Done"}
                  </button>
                </div>
              </article>
            ))
          )}
        </section>

        <aside className={styles.previewPanel}>
          {selectedResource ? (
            <>
              <div className={styles.previewHeader}>
                <span className={styles.badge}>{selectedResource.type}</span>
                <span className={styles.badgeLight}>
                  {selectedResource.difficulty}
                </span>
              </div>

              <h2>{selectedResource.title}</h2>

              <p className={styles.previewDescription}>
                {selectedResource.description}
              </p>

              <div className={styles.previewBlock}>
                <strong>Used in</strong>
                <div className={styles.tagList}>
                  {selectedResource.studios.map((studio) => (
                    <span key={studio}>{studio}</span>
                  ))}
                </div>
              </div>

              <div className={styles.previewBlock}>
                <strong>Category</strong>
                <p>{selectedResource.category}</p>
              </div>

              <div className={styles.previewBlock}>
                <strong>How this helps</strong>
                <p>{selectedResource.learningUse}</p>
              </div>

              <div className={styles.previewBlock}>
                <strong>Tags</strong>
                <div className={styles.tagList}>
                  {selectedResource.tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </div>

              <div className={styles.previewActions}>
                <a
                  href={selectedResource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="button"
                >
                  Open Resource
                </a>

                <button
                  type="button"
                  className="button secondaryButton"
                  onClick={() => toggleFavorite(selectedResource.id)}
                >
                  {favorites[selectedResource.id]
                    ? "Remove Favorite"
                    : "Add Favorite"}
                </button>

                <button
                  type="button"
                  className="button secondaryButton"
                  onClick={() => toggleCompleted(selectedResource.id)}
                >
                  {completed[selectedResource.id]
                    ? "Completed"
                    : "Mark Completed"}
                </button>
              </div>

              <label className={styles.notesBox}>
                <span>My Notes</span>
                <textarea
                  rows={8}
                  value={notes[selectedResource.id] || ""}
                  onChange={(event) =>
                    updateNote(selectedResource.id, event.target.value)
                  }
                  placeholder="Add notes, professor comments, or how you will use this resource..."
                />
              </label>
            </>
          ) : (
            <div className={styles.emptyState}>Select a resource.</div>
          )}
        </aside>
      </section>
    </main>
  );
}
