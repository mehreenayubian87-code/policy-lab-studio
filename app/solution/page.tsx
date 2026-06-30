// app/solution/page.tsx
"use client";

import StudioEngine from "@/components/StudioEngine/StudioEngine";
import { solutionStudioConfig } from "@/components/StudioEngine/studioConfigs";

export default function SolutionStudio() {
  return <StudioEngine config={solutionStudioConfig} />;
}