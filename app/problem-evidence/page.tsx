"use client";

import StudioEngine from "@/components/StudioEngine/StudioEngine";
import { problemStudioConfig } from "@/components/StudioEngine/studioConfigs";

export default function ProblemEvidenceStudio() {
  return <StudioEngine config={problemStudioConfig} />;
}