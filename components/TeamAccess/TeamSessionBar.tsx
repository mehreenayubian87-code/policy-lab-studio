"use client";

import { createContext, useContext, useEffect, useState } from "react";
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

const AdminSessionContext = createContext<boolean | null>(null);

export function useAdminSession() {
  return useContext(AdminSessionContext);
}

export default function TeamSessionBar({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { project, clearProject } = useProject();
  const [isAdminSession, setIsAdminSession] = useState<boolean | null>(null);

  const isLoggedIn = Boolean(project.setup.projectNumber.trim());
  const isTeamPage = isTeamRoute(pathname ?? "");

  useEffect(() => {
    let isActive = true;

    fetch("/api/professor-admin/login", { cache: "no-store" })
      .then((response) => response.json())
      .then((data: { isAdmin?: boolean }) => {
        if (isActive) setIsAdminSession(data.isAdmin === true);
      })
      .catch(() => {
        if (isActive) setIsAdminSession(false);
      });

    return () => {
      isActive = false;
    };
  }, [pathname]);

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
    <AdminSessionContext.Provider value={isAdminSession}>
      {isLoggedIn && isTeamPage ? (
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            display: "flex",
            justifyContent: "flex-end",
            padding: "12px 16px",
            background:
              "linear-gradient(135deg, rgba(8, 19, 33, 0.92), rgba(15, 61, 59, 0.82))",
            borderBottom: "1px solid rgba(255, 255, 255, 0.18)",
            boxShadow: "0 10px 30px rgba(3, 7, 18, 0.24)",
            backdropFilter: "blur(10px)",
          }}
        >
          {isAdminSession === true ? (
            <button
              type="button"
              className="button secondaryButton"
              onClick={() => router.push("/professor-admin")}
            >
              Return to projects list
            </button>
          ) : isAdminSession === false ? (
            <button type="button" className="button secondaryButton" onClick={handleLogout}>
              Logout
            </button>
          ) : null}
        </div>
      ) : null}
      {children}
    </AdminSessionContext.Provider>
  );
}
