"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useProject } from "@/components/ProjectState/ProjectProvider";

const TEAM_ROUTES = [
  "/dashboard",
  "/implementation",
  "/lab-setup",
  "/orientation",
  "/overview",
  "/portfolio",
  "/poster",
  "/presentation",
  "/problem-evidence",
  "/resource-hub",
  "/solution",
  "/stakeholder-systems",
];

function isTeamRoute(pathname: string) {
  return TEAM_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export default function TeamSessionBar({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { project, clearProject } = useProject();

  const isLoggedIn = Boolean(project.setup.projectNumber.trim());
  const isTeamPage = isTeamRoute(pathname ?? "");

  useEffect(() => {
    if (isTeamPage && !isLoggedIn) {
      router.replace("/");
    }
  }, [isTeamPage, isLoggedIn, router]);

  const handleLogout = () => {
    clearProject();
    router.replace("/");
  };

  return (
    <>
      {isLoggedIn && isTeamPage ? (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            display: "flex",
            justifyContent: "flex-end",
            padding: "12px 16px",
            background: "#ffffff",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <button type="button" className="button secondaryButton" onClick={handleLogout}>
            Logout
          </button>
        </div>
      ) : null}
      {children}
    </>
  );
}
