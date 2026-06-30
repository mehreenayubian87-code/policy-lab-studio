// app/implementation/page.tsx
"use client";

import StudioEngine from "@/components/StudioEngine/StudioEngine";
import { implementationStudioConfig } from "@/components/StudioEngine/studioConfigs";

export default function ImplementationStudio() {
  return <StudioEngine config={implementationStudioConfig} />;
}