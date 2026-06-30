// app/stakeholder-systems/page.tsx
"use client";

import StudioEngine from "@/components/StudioEngine/StudioEngine";
import { processStudioConfig } from "@/components/StudioEngine/studioConfigs";

export default function StakeholderSystemsStudio() {
  return <StudioEngine config={processStudioConfig} />;
}