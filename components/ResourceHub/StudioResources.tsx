"use client";

import Link from "next/link";
import { resourceLibrary } from "./resourceLibrary";

type StudioResourcesProps = {
  studio: string;
  limit?: number;
};

export default function StudioResources({
  studio,
  limit = 6,
}: StudioResourcesProps) {
  const resources = resourceLibrary
    .filter((resource) => resource.studios.includes(studio))
    .slice(0, limit);

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {resources.length === 0 ? (
        <div className="panelHint">
          <p className="fieldNote" style={{ marginBottom: 0 }}>
            No resources have been assigned to this studio yet.
          </p>
        </div>
      ) : (
        resources.map((resource) => (
          <div
            key={resource.id}
            className="panelHint"
            style={{
              display: "grid",
              gap: 8,
              padding: 12,
            }}
          >
            <div>
              <strong>{resource.title}</strong>

              <p
                className="fieldNote"
                style={{
                  marginTop: 5,
                  marginBottom: 0,
                }}
              >
                {resource.type} · {resource.category}
              </p>
            </div>

            <a
              href={resource.url}
              target="_blank"
              rel="noreferrer"
              className="button secondaryButton"
              style={{
                width: "100%",
                justifyContent: "center",
              }}
            >
              Open Resource
            </a>
          </div>
        ))
      )}

      <Link
        href="/resource-hub"
        className="button secondaryButton"
        style={{
          width: "100%",
          justifyContent: "center",
        }}
      >
        Open Full Resource Hub
      </Link>
    </div>
  );
}