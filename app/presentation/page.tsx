"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import pptxgen from "pptxgenjs";
import styles from "./presentation.module.css";
import {
  buildPosterContent,
  readAllStudioObjectsFromProject,
} from "@/components/ProjectState/projectService";
import { useProject } from "@/components/ProjectState/ProjectProvider";
import { getProjectStudioStorageKey } from "@/components/ProjectState/projectStorage";

type PosterBlock = {
  id: string;
  title: string;
  type?: string;
  content: string;
  kind?: string;
  imageUrl?: string;
  caption?: string;
};

type PosterHeader = {
  title: string;
  subtitle: string;
  logo: string;
  team: string;
  course: string;
  instructor: string;
};

type ExportItem = {
  id: string;
  label: string;
  source: string;
  content: string;
  selected: boolean;
};

type PitchSection = {
  id: string;
  title: string;
  content: string;
  script: string;
  selected: boolean;
  open: boolean;
};

type JudgeQuestion = {
  id: string;
  question: string;
  answer: string;
  open: boolean;
};

type SavedPoster = {
  posterHeader?: PosterHeader;
  blocks?: PosterBlock[];
};

type StudioExportObject = {
  id: string;
  title: string;
  type: string;
  content: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  icon?: string;
  imageDataUrl?: string;
  visualType?: "image" | "chart" | "icon";
  chartType?: "bar" | "line" | "pie" | "scatter";
  chartData?: Array<{ label: string; value: number }>;
  embeddedVisuals?: Array<{
    id: string;
    insertIndex?: number;
    imageDataUrl?: string;
    visualType?: "image" | "chart";
    chartType?: "bar" | "line" | "pie" | "scatter";
    chartData?: Array<{ label: string; value: number }>;
    icon?: string;
  }>;
};

type StudioWorkspaceExport = {
  id: string;
  title: string;
  objects: StudioExportObject[];
};

const PRESENTATION_STORAGE_KEY = "plstudio_presentation_v2";
const POSTER_STORAGE_KEY = "plstudio_poster_v3";

const defaultPosterHeader: PosterHeader = {
  title: "Policy Poster Presentation",
  subtitle: "Prepare a clear presentation from your final poster.",
  logo: "🎤",
  team: "Team Name",
  course: "Course / Policy Lab",
  instructor: "Instructor",
};

const defaultQuestions = [
  "What specific policy problem is your poster addressing?",
  "Who is most affected by this problem, and why did you prioritize them?",
  "What is the strongest evidence supporting your problem statement?",
  "How does your proposed solution respond directly to the root causes?",
  "Which stakeholders are most important for implementation?",
  "What risks could affect implementation, and how would you manage them?",
  "What indicators would show that this policy is working?",
  "What resources, funding, or institutional support would be required?",
  "How would this policy be sustained beyond the initial implementation phase?",
  "What is the main limitation of your proposal, and how would you address it?",
];

type PptxSlide = {
  title: string;
  source: string;
  content: string;
};

const xmlEscape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

const crc32 = (data: Uint8Array) => {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const createZipBlob = (
  files: Array<{ path: string; content: string | Uint8Array }>,
  type: string
) => {
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];
  const centralDirectory: Uint8Array[] = [];
  const now = new Date();
  const dosTime =
    (now.getHours() << 11) |
    (now.getMinutes() << 5) |
    Math.floor(now.getSeconds() / 2);
  const dosDate =
    ((Math.max(1980, now.getFullYear()) - 1980) << 9) |
    ((now.getMonth() + 1) << 5) |
    now.getDate();
  let offset = 0;

  const makeHeader = (length: number, writer: (view: DataView) => void) => {
    const buffer = new ArrayBuffer(length);
    const view = new DataView(buffer);
    writer(view);
    return new Uint8Array(buffer);
  };

  const pushChunk = (chunk: Uint8Array) => {
    chunks.push(chunk);
    offset += chunk.length;
  };

  files.forEach((file) => {
    const name = encoder.encode(file.path);
    const data =
      typeof file.content === "string"
        ? encoder.encode(file.content)
        : file.content;
    const checksum = crc32(data);
    const localOffset = offset;

    pushChunk(
      makeHeader(30, (view) => {
        view.setUint32(0, 0x04034b50, true);
        view.setUint16(4, 20, true);
        view.setUint16(6, 0, true);
        view.setUint16(8, 0, true);
        view.setUint16(10, dosTime, true);
        view.setUint16(12, dosDate, true);
        view.setUint32(14, checksum, true);
        view.setUint32(18, data.length, true);
        view.setUint32(22, data.length, true);
        view.setUint16(26, name.length, true);
        view.setUint16(28, 0, true);
      })
    );
    pushChunk(name);
    pushChunk(data);

    centralDirectory.push(
      makeHeader(46, (view) => {
        view.setUint32(0, 0x02014b50, true);
        view.setUint16(4, 20, true);
        view.setUint16(6, 20, true);
        view.setUint16(8, 0, true);
        view.setUint16(10, 0, true);
        view.setUint16(12, dosTime, true);
        view.setUint16(14, dosDate, true);
        view.setUint32(16, checksum, true);
        view.setUint32(20, data.length, true);
        view.setUint32(24, data.length, true);
        view.setUint16(28, name.length, true);
        view.setUint16(30, 0, true);
        view.setUint16(32, 0, true);
        view.setUint16(34, 0, true);
        view.setUint16(36, 0, true);
        view.setUint32(38, 0, true);
        view.setUint32(42, localOffset, true);
      }),
      name
    );
  });

  const centralOffset = offset;
  centralDirectory.forEach(pushChunk);
  const centralSize = offset - centralOffset;

  pushChunk(
    makeHeader(22, (view) => {
      view.setUint32(0, 0x06054b50, true);
      view.setUint16(4, 0, true);
      view.setUint16(6, 0, true);
      view.setUint16(8, files.length, true);
      view.setUint16(10, files.length, true);
      view.setUint32(12, centralSize, true);
      view.setUint32(16, centralOffset, true);
      view.setUint16(20, 0, true);
    })
  );

  const blobParts = chunks.map((chunk) => {
    const buffer = new ArrayBuffer(chunk.byteLength);
    new Uint8Array(buffer).set(chunk);
    return buffer;
  });

  return new Blob(blobParts, { type });
};

const buildSlideXml = (slide: PptxSlide) => {
  const paragraphs = (slide.content || "Add slide content here.")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8)
    .map(
      (line) => `
        <a:p>
          <a:r>
            <a:rPr lang="en-US" sz="2000"><a:solidFill><a:srgbClr val="1f2937"/></a:solidFill></a:rPr>
            <a:t>${xmlEscape(line)}</a:t>
          </a:r>
        </a:p>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
  <p:cSld>
    <p:bg><p:bgPr><a:solidFill><a:srgbClr val="f8fafc"/></a:solidFill><a:effectLst/></p:bgPr></p:bg>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="2" name="Title"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="548640" y="457200"/><a:ext cx="8046720" cy="762000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr>
        <p:txBody><a:bodyPr wrap="square"/><a:lstStyle/><a:p><a:r><a:rPr lang="en-US" sz="3400" b="1"><a:solidFill><a:srgbClr val="0f2f66"/></a:solidFill></a:rPr><a:t>${xmlEscape(slide.title)}</a:t></a:r></a:p></p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="3" name="Source"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="548640" y="1270000"/><a:ext cx="8046720" cy="381000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/></p:spPr>
        <p:txBody><a:bodyPr wrap="square"/><a:lstStyle/><a:p><a:r><a:rPr lang="en-US" sz="1500" b="1"><a:solidFill><a:srgbClr val="7c5a2c"/></a:solidFill></a:rPr><a:t>${xmlEscape(slide.source)}</a:t></a:r></a:p></p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr><p:cNvPr id="4" name="Content"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
        <p:spPr><a:xfrm><a:off x="548640" y="1859280"/><a:ext cx="8046720" cy="4404360"/></a:xfrm><a:prstGeom prst="roundRect"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="ffffff"/></a:solidFill><a:ln w="12700"><a:solidFill><a:srgbClr val="d4a574"/></a:solidFill></a:ln></p:spPr>
        <p:txBody><a:bodyPr wrap="square" lIns="182880" tIns="152400" rIns="182880" bIns="152400"/><a:lstStyle/>${paragraphs}</p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
  <p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr>
</p:sld>`;
};

const buildPptxBlob = (slides: PptxSlide[]) => {
  const safeSlides = slides.length
    ? slides
    : [
        {
          title: "Policy Lab Presentation",
          source: "Presentation Studio",
          content: "Add slide content here.",
        },
      ];
  const slideOverrides = safeSlides
    .map(
      (_, index) =>
        `<Override PartName="/ppt/slides/slide${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`
    )
    .join("");
  const slideIds = safeSlides
    .map((_, index) => `<p:sldId id="${256 + index}" r:id="rId${index + 1}"/>`)
    .join("");
  const slideRels = safeSlides
    .map(
      (_, index) =>
        `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${index + 1}.xml"/>`
    )
    .join("");
  const slideLayoutRels = safeSlides.map((_, index) => ({
    path: `ppt/slides/_rels/slide${index + 1}.xml.rels`,
    content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>`,
  }));
  const createdAt = new Date().toISOString();
  const files = [
    {
      path: "[Content_Types].xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/><Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/><Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/><Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>${slideOverrides}</Types>`,
    },
    {
      path: "_rels/.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`,
    },
    {
      path: "docProps/core.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>Policy Lab Presentation</dc:title><dc:creator>Policy Lab Studio</dc:creator><cp:lastModifiedBy>Policy Lab Studio</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${createdAt}</dcterms:modified></cp:coreProperties>`,
    },
    {
      path: "docProps/app.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Policy Lab Studio</Application><PresentationFormat>On-screen Show (4:3)</PresentationFormat><Slides>${safeSlides.length}</Slides></Properties>`,
    },
    {
      path: "ppt/presentation.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId${safeSlides.length + 1}"/></p:sldMasterIdLst><p:sldIdLst>${slideIds}</p:sldIdLst><p:sldSz cx="9144000" cy="6858000" type="screen4x3"/><p:notesSz cx="6858000" cy="9144000"/><p:defaultTextStyle><a:defPPr><a:defRPr lang="en-US"/></a:defPPr></p:defaultTextStyle></p:presentation>`,
    },
    {
      path: "ppt/_rels/presentation.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${slideRels}<Relationship Id="rId${safeSlides.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/></Relationships>`,
    },
    {
      path: "ppt/slideMasters/slideMaster1.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:bg><p:bgPr><a:solidFill><a:srgbClr val="f8fafc"/></a:solidFill><a:effectLst/></p:bgPr></p:bg><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/><p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles></p:sldMaster>`,
    },
    {
      path: "ppt/slideMasters/_rels/slideMaster1.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>`,
    },
    {
      path: "ppt/slideLayouts/slideLayout1.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank" preserve="1"><p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>`,
    },
    {
      path: "ppt/slideLayouts/_rels/slideLayout1.xml.rels",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>`,
    },
    {
      path: "ppt/theme/theme1.xml",
      content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="Policy Lab"><a:themeElements><a:clrScheme name="Policy Lab"><a:dk1><a:srgbClr val="111827"/></a:dk1><a:lt1><a:srgbClr val="ffffff"/></a:lt1><a:dk2><a:srgbClr val="0f2f66"/></a:dk2><a:lt2><a:srgbClr val="f8fafc"/></a:lt2><a:accent1><a:srgbClr val="0f2f66"/></a:accent1><a:accent2><a:srgbClr val="d4a574"/></a:accent2><a:accent3><a:srgbClr val="0f766e"/></a:accent3><a:accent4><a:srgbClr val="7c5a2c"/></a:accent4><a:accent5><a:srgbClr val="64748b"/></a:accent5><a:accent6><a:srgbClr val="38bdf8"/></a:accent6><a:hlink><a:srgbClr val="2563eb"/></a:hlink><a:folHlink><a:srgbClr val="7c3aed"/></a:folHlink></a:clrScheme><a:fontScheme name="Policy Lab"><a:majorFont><a:latin typeface="Arial"/><a:ea typeface=""/><a:cs typeface=""/></a:majorFont><a:minorFont><a:latin typeface="Arial"/><a:ea typeface=""/><a:cs typeface=""/></a:minorFont></a:fontScheme><a:fmtScheme name="Policy Lab"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:schemeClr val="phClr"/></a:gs><a:gs pos="100000"><a:schemeClr val="phClr"/></a:gs></a:gsLst><a:lin ang="5400000" scaled="0"/></a:gradFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="6350" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="12700" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="19050" cap="flat" cmpd="sng" algn="ctr"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"/></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements><a:objectDefaults/><a:extraClrSchemeLst/></a:theme>`,
    },
    ...safeSlides.map((slide, index) => ({
      path: `ppt/slides/slide${index + 1}.xml`,
      content: buildSlideXml(slide),
    })),
    ...slideLayoutRels,
  ];

  return createZipBlob(
    files,
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  );
};

const readSavedPoster = (storageKey: string): SavedPoster => {
  if (!storageKey) return {};

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.blocks)) return parsed;
  } catch {
    return {};
  }

  return {};
};

const cleanText = (value: string) => value.replace(/\s+/g, " ").trim();

const buildDefaultScript = (title: string, content: string) => {
  const cleanContent = cleanText(content);

  if (!cleanContent) {
    return `In this section, I will briefly explain the key point related to ${title.toLowerCase()}.`;
  }

  return `For ${title.toLowerCase()}, our poster highlights that ${cleanContent}`;
};

export default function PresentationStudioPage() {
  const { project, updateStudioState } = useProject();
  const projectScopedStorageKey = getProjectStudioStorageKey(
    project.setup.projectNumber,
    PRESENTATION_STORAGE_KEY
  );
  const projectScopedPosterStorageKey = getProjectStudioStorageKey(
    project.setup.projectNumber,
    POSTER_STORAGE_KEY
  );
  const [posterHeader, setPosterHeader] =
    useState<PosterHeader>(defaultPosterHeader);
  const [exportItems, setExportItems] = useState<ExportItem[]>([]);
  const [pitchSections, setPitchSections] = useState<PitchSection[]>([]);
  const [questions, setQuestions] = useState<JudgeQuestion[]>([]);
  const [activeSection, setActiveSection] = useState<
    "export" | "script" | "qa" | null
  >("export");
  const hydratedProjectKey = useRef("");
  const [lastSaved, setLastSaved] = useState("Not saved yet");
  const [statusMessage, setStatusMessage] = useState("");

  const selectedExportCount = useMemo(
    () => exportItems.filter((item) => item.selected).length,
    [exportItems]
  );

  const selectedPitchCount = useMemo(
    () => pitchSections.filter((section) => section.selected).length,
    [pitchSections]
  );

  useEffect(() => {
    const projectKey = project.setup.projectNumber.trim().toUpperCase();
    if (!projectKey || hydratedProjectKey.current === projectKey) return;

    const storedState = project.studioStates?.presentation;

    if (storedState && typeof storedState === "object") {
      const parsed = storedState as {
        posterHeader?: PosterHeader;
        exportItems?: ExportItem[];
        pitchSections?: PitchSection[];
        questions?: JudgeQuestion[];
        lastSaved?: string;
      };

      setPosterHeader(parsed.posterHeader || defaultPosterHeader);
      setExportItems(parsed.exportItems || []);
      setPitchSections(parsed.pitchSections || []);
      setQuestions(parsed.questions || []);
      setLastSaved(parsed.lastSaved || "Loaded saved presentation.");
      hydratedProjectKey.current = projectKey;
      return;
    }

    const saved = projectScopedStorageKey
      ? localStorage.getItem(projectScopedStorageKey)
      : null;

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPosterHeader(parsed.posterHeader || defaultPosterHeader);
        setExportItems(parsed.exportItems || []);
        setPitchSections(parsed.pitchSections || []);
        setQuestions(parsed.questions || []);
        setLastSaved(parsed.lastSaved || "Loaded saved work");
        hydratedProjectKey.current = projectKey;
        return;
      } catch {
        if (projectScopedStorageKey) localStorage.removeItem(projectScopedStorageKey);
      }
    }

    importFromPoster();
    hydratedProjectKey.current = projectKey;
  }, [project.setup.projectNumber, project.studioStates, projectScopedStorageKey]);

  useEffect(() => {
    const timer = setInterval(() => {
      saveProgress("Auto-saved");
    }, 45000);

    return () => clearInterval(timer);
  }, [posterHeader, exportItems, pitchSections, questions, projectScopedStorageKey]);

  const importFromPoster = () => {
    const savedPoster =
      project.studioStates?.poster && typeof project.studioStates.poster === "object"
        ? (project.studioStates.poster as SavedPoster)
        : readSavedPoster(projectScopedPosterStorageKey);
    const studioObjects = readAllStudioObjectsFromProject(project);
    const fallbackContent = buildPosterContent(studioObjects);

    const header = savedPoster.posterHeader || defaultPosterHeader;
    const posterBlocks = Array.isArray(savedPoster.blocks)
      ? savedPoster.blocks
      : [];

    const sectionBlocks: PosterBlock[] =
      posterBlocks.length > 0
        ? posterBlocks
        : [
            {
              id: "problem",
              title: "Problem",
              content: fallbackContent.problem || "",
              kind: "section",
            },
            {
              id: "evidence",
              title: "Evidence",
              content: fallbackContent.evidence || "",
              kind: "section",
            },
            {
              id: "stakeholders",
              title: "Stakeholders",
              content: fallbackContent.stakeholders || "",
              kind: "section",
            },
            {
              id: "population",
              title: "Target Population / Journey",
              content: fallbackContent.population || "",
              kind: "section",
            },
            {
              id: "solution",
              title: "Solution",
              content: fallbackContent.solution || "",
              kind: "section",
            },
            {
              id: "implementation",
              title: "Implementation",
              content: fallbackContent.implementation || "",
              kind: "section",
            },
            {
              id: "risks",
              title: "Risks",
              content: fallbackContent.risks || "",
              kind: "section",
            },
            {
              id: "indicators",
              title: "Indicators",
              content: fallbackContent.indicators || "",
              kind: "section",
            },
          ];

    const exportList: ExportItem[] = [
      {
        id: "poster-title",
        label: header.title || "Poster Title",
        source: "Final Poster Header",
        content: header.subtitle || "",
        selected: true,
      },
      ...sectionBlocks.map((block) => ({
        id: block.id,
        label: block.title,
        source:
          block.kind === "image"
            ? "Poster Image"
            : block.kind === "chart"
            ? "Poster Chart"
            : block.kind === "icon"
            ? "Poster Icon"
            : "Final Poster Section",
        content:
          block.kind === "image"
            ? block.caption || block.content || "Image included in poster."
            : block.content || "",
        selected: true,
      })),
    ];

    const pitchList: PitchSection[] = [
      {
        id: "opening",
        title: "Opening",
        content: header.subtitle || "",
        script: `Good morning. Our presentation is based on our poster titled "${header.title}". We will briefly explain the policy problem, evidence, solution, implementation plan, and expected impact.`,
        selected: true,
        open: true,
      },
      ...sectionBlocks.map((block) => ({
        id: block.id,
        title: block.title,
        content: block.content || "",
        script: buildDefaultScript(block.title, block.content || ""),
        selected: true,
        open: false,
      })),
      {
        id: "closing",
        title: "Closing",
        content: "",
        script:
          "To conclude, our proposal is evidence-informed, implementation-focused, and designed to support better policy outcomes. Thank you.",
        selected: true,
        open: false,
      },
    ];

    const questionList: JudgeQuestion[] = defaultQuestions.map(
      (question, index) => ({
        id: `q${index + 1}`,
        question,
        answer: "",
        open: false,
      })
    );

    setPosterHeader(header);
    setExportItems(exportList);
    setPitchSections(pitchList);
    setQuestions(questionList);
    setStatusMessage("Imported latest saved poster content.");
  };

  const saveProgress = (message = "Saved") => {
    const savedAt = new Date().toLocaleTimeString();
    const presentationState = {
      posterHeader,
      exportItems,
      pitchSections,
      questions,
      lastSaved: `${message} at ${savedAt}`,
    };

    if (projectScopedStorageKey) {
      localStorage.setItem(
        projectScopedStorageKey,
        JSON.stringify(presentationState)
      );
    }
    updateStudioState("presentation", presentationState);

    setLastSaved(`${message} at ${savedAt}`);
    setStatusMessage(`${message} successfully.`);
  };

  const toggleMainSection = (section: "export" | "script" | "qa") => {
    setActiveSection((current) => (current === section ? null : section));
  };

  const toggleExportItem = (id: string) => {
    setExportItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const togglePitchSelection = (id: string) => {
    setPitchSections((prev) =>
      prev.map((section) =>
        section.id === id
          ? { ...section, selected: !section.selected }
          : section
      )
    );
  };

  const togglePitchOpen = (id: string) => {
    setPitchSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, open: !section.open } : section
      )
    );
  };

  const updatePitch = (id: string, script: string) => {
    setPitchSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, script } : section
      )
    );
  };

  const toggleQuestionOpen = (id: string) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === id
          ? { ...question, open: !question.open }
          : question
      )
    );
  };

  const updateAnswer = (id: string, answer: string) => {
    setQuestions((prev) =>
      prev.map((question) =>
        question.id === id ? { ...question, answer } : question
      )
    );
  };

  const preparePowerPointExport = async () => {
    try {
      const pptx = new pptxgen();
      pptx.layout = "LAYOUT_4x3";
      pptx.author = "Policy Lab Studio";
      pptx.company = "Policy Lab Studio";
      pptx.subject = "Policy Lab Presentation";
      pptx.title = posterHeader.title || "Policy Lab Presentation";
      pptx.theme = {
        headFontFace: "Arial",
        bodyFontFace: "Arial",
      };

      const studioSlides: StudioWorkspaceExport[] = [
        ["problem", "Problem Studio"],
        ["process", "Process Studio"],
        ["solution", "Solution Studio"],
        ["implementation", "Implementation Studio"],
      ].map(([id, title]) => {
        const state = project.studioStates?.[id];
        const objects =
          state && typeof state === "object" && Array.isArray((state as { objects?: unknown[] }).objects)
            ? ((state as { objects: StudioExportObject[] }).objects ?? [])
            : [];

        return { id, title, objects };
      });

      const posterState =
        project.studioStates?.poster && typeof project.studioStates.poster === "object"
          ? (project.studioStates.poster as { blocks?: StudioExportObject[] })
          : {};

      if (Array.isArray(posterState.blocks) && posterState.blocks.length) {
        studioSlides.push({
          id: "poster",
          title: "Poster Studio",
          objects: posterState.blocks.map((block) => ({
            ...block,
            type: block.type || block.title || "poster",
            content: block.content || block.title || "",
          })),
        });
      }

      const selectedSlides = studioSlides.filter((studio) => studio.objects.length);
      const slidesToExport = selectedSlides.length ? selectedSlides : studioSlides.slice(0, 4);
      const slideWidth = 10;
      const slideHeight = 7.5;
      const canvas = { x: 0.42, y: 1.1, w: 9.16, h: 5.95 };
      const normalizeColor = (value?: string, fallback = "FFFFFF") => {
        const color = (value || fallback).replace("#", "").trim();
        return /^[0-9a-fA-F]{6}$/.test(color) ? color.toUpperCase() : fallback;
      };
      const addChartToSlide = (
        slide: pptxgen.Slide,
        object: StudioExportObject,
        frame: { x: number; y: number; w: number; h: number }
      ) => {
        const data = object.chartData || [];
        if (!data.length) return;

        const maxValue = Math.max(...data.map((row) => row.value), 1);
        const barGap = Math.min(0.06, frame.h / Math.max(data.length, 1) / 4);
        const barHeight = Math.max(0.08, (frame.h - barGap * (data.length - 1)) / Math.max(data.length, 1));

        data.slice(0, 6).forEach((row, index) => {
          const y = frame.y + index * (barHeight + barGap);
          const labelWidth = Math.min(0.85, frame.w * 0.32);
          const valueWidth = Math.max(0.05, (frame.w - labelWidth - 0.08) * (row.value / maxValue));
          slide.addText(row.label, {
            x: frame.x,
            y,
            w: labelWidth,
            h: barHeight,
            fontFace: "Arial",
            fontSize: 5.5,
            color: "334155",
            margin: 0,
            fit: "shrink",
          });
          slide.addShape(pptx.ShapeType.rect, {
            x: frame.x + labelWidth + 0.05,
            y: y + barHeight * 0.22,
            w: valueWidth,
            h: barHeight * 0.56,
            fill: { color: "0F766E" },
            line: { color: "0F766E", transparency: 100 },
          });
        });
      };
      const addObjectCard = (
        slide: pptxgen.Slide,
        object: StudioExportObject,
        frame: { x: number; y: number; w: number; h: number }
      ) => {
        const fillColor = normalizeColor(object.color, "FFFFFF");
        const textColor = fillColor === "FFFFFF" ? "1F2937" : "111827";
        slide.addShape(pptx.ShapeType.roundRect, {
          ...frame,
          rectRadius: 0.06,
          fill: { color: fillColor, transparency: fillColor === "FFFFFF" ? 0 : 8 },
          line: { color: "D4A574", width: 0.7 },
        });
        slide.addText(object.title || object.type || "Workspace object", {
          x: frame.x + 0.08,
          y: frame.y + 0.06,
          w: Math.max(0.2, frame.w - 0.16),
          h: 0.22,
          fontFace: "Arial",
          fontSize: 7.5,
          bold: true,
          color: "0F2F66",
          margin: 0,
          fit: "shrink",
        });

        const contentX = frame.x + 0.08;
        const contentY = frame.y + 0.34;
        const contentW = Math.max(0.2, frame.w - 0.16);
        const contentH = Math.max(0.18, frame.h - 0.42);

        if (object.imageDataUrl) {
          slide.addImage({
            data: object.imageDataUrl,
            x: contentX,
            y: contentY,
            w: contentW,
            h: contentH,
            sizing: { type: "contain", x: contentX, y: contentY, w: contentW, h: contentH },
          });
          return;
        }

        if (object.chartData?.length || object.visualType === "chart" || object.type === "chart") {
          addChartToSlide(slide, object, {
            x: contentX,
            y: contentY,
            w: contentW,
            h: contentH,
          });
        } else if (object.icon || object.visualType === "icon" || object.type === "icon") {
          slide.addText(object.icon || "◆", {
            x: contentX,
            y: contentY,
            w: Math.min(0.5, contentW),
            h: Math.min(0.5, contentH),
            fontSize: 20,
            margin: 0,
            color: "7C5A2C",
          });
          slide.addText(cleanText(object.content || object.title || ""), {
            x: contentX + 0.48,
            y: contentY,
            w: Math.max(0.2, contentW - 0.52),
            h: contentH,
            fontFace: "Arial",
            fontSize: 6.5,
            color: textColor,
            margin: 0,
            fit: "shrink",
          });
        } else {
          slide.addText(cleanText(object.content || ""), {
            x: contentX,
            y: contentY,
            w: contentW,
            h: contentH,
            fontFace: "Arial",
            fontSize: 6.5,
            color: textColor,
            margin: 0,
            valign: "top",
            fit: "shrink",
          });
        }

        const embeddedVisual = object.embeddedVisuals?.find(
          (visual) => visual.imageDataUrl || visual.chartData?.length
        );
        if (!embeddedVisual || frame.w < 1.2 || frame.h < 1.0) return;

        const visualFrame = {
          x: frame.x + frame.w * 0.52,
          y: frame.y + frame.h * 0.5,
          w: frame.w * 0.4,
          h: frame.h * 0.36,
        };
        if (embeddedVisual.imageDataUrl) {
          slide.addImage({
            data: embeddedVisual.imageDataUrl,
            ...visualFrame,
            sizing: { type: "contain", ...visualFrame },
          });
        } else if (embeddedVisual.chartData?.length) {
          addChartToSlide(slide, { ...object, chartData: embeddedVisual.chartData }, visualFrame);
        }
      };

      slidesToExport.forEach((studio, index) => {
        const slide = pptx.addSlide();
        const objects = studio.objects
          .filter((object) => object && typeof object === "object")
          .sort((left, right) => (left.y ?? 0) - (right.y ?? 0) || (left.x ?? 0) - (right.x ?? 0));

        slide.background = { color: "F8FAFC" };
        slide.addText(studio.title, {
          x: 0.42,
          y: 0.25,
          w: 6.5,
          h: 0.36,
          fontFace: "Arial",
          fontSize: 22,
          bold: true,
          color: "0F2F66",
          margin: 0,
        });
        slide.addText(`${project.setup.projectNumber || project.setup.policyIssue || "Policy Lab"} workspace export`, {
          x: 0.42,
          y: 0.66,
          w: 7.8,
          h: 0.22,
          fontFace: "Arial",
          fontSize: 8,
          bold: true,
          color: "7C5A2C",
          margin: 0,
          fit: "shrink",
        });
        slide.addShape(pptx.ShapeType.rect, {
          ...canvas,
          fill: { color: "FFFFFF", transparency: 0 },
          line: { color: "CBD5E1", width: 0.8 },
        });

        if (!objects.length) {
          slide.addText("No saved workspace objects were found for this studio.", {
            x: canvas.x + 0.35,
            y: canvas.y + 0.4,
            w: canvas.w - 0.7,
            h: 0.4,
            fontFace: "Arial",
            fontSize: 14,
            color: "64748B",
            margin: 0,
          });
        } else {
          const minX = Math.min(...objects.map((object) => object.x ?? 0));
          const minY = Math.min(...objects.map((object) => object.y ?? 0));
          const maxX = Math.max(...objects.map((object) => (object.x ?? 0) + (object.width ?? 320)));
          const maxY = Math.max(...objects.map((object) => (object.y ?? 0) + (object.height ?? 180)));
          const workspaceW = Math.max(1, maxX - minX);
          const workspaceH = Math.max(1, maxY - minY);
          const scale = Math.min(canvas.w / workspaceW, canvas.h / workspaceH, 0.018);

          objects.forEach((object) => {
            const frame = {
              x: canvas.x + ((object.x ?? 0) - minX) * scale,
              y: canvas.y + ((object.y ?? 0) - minY) * scale,
              w: Math.max(0.85, Math.min(canvas.w, (object.width ?? 320) * scale)),
              h: Math.max(0.62, Math.min(canvas.h, (object.height ?? 180) * scale)),
            };
            addObjectCard(slide, object, frame);
          });
        }

        slide.addText(`${index + 1}/${slidesToExport.length}`, {
          x: slideWidth - 1.1,
          y: slideHeight - 0.32,
          w: 0.65,
          h: 0.16,
          fontFace: "Arial",
          fontSize: 8,
          color: "64748B",
          align: "right",
          margin: 0,
        });
      });

      await pptx.writeFile({ fileName: "policy-lab-presentation.pptx" });
      setStatusMessage("PowerPoint exported with one slide per saved studio workspace.");
    } catch (error) {
      console.error(error);
      setStatusMessage("PowerPoint export failed. Please try again after saving the studios.");
    }
  };

  return (
    <main className={styles.presentationPage}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <div className={styles.kicker}>POLICY LAB STUDIO</div>

          <h1 className={styles.pageTitle}>
            Presentation
            <br />
            Studio
          </h1>

          <p className={styles.subtitle}>
            Prepare your PowerPoint presentation, pitch script, and judges’
            Q&amp;A from your completed poster.
          </p>

          <p className={styles.savedText}>{lastSaved}</p>
        </div>

        <div className={styles.headerActions}>
          <Link href="/" className="button secondaryButton">
            Home
          </Link>

          <Link href="/dashboard" className="button secondaryButton">
            Dashboard
          </Link>

          <Link href="/poster" className="button secondaryButton">
            Previous Studio
          </Link>

<Link href="/portfolio" className="button secondaryButton">
  Next Studio
</Link>

          <button
            type="button"
            className="button secondaryButton"
            onClick={importFromPoster}
          >
            Import Latest Poster
          </button>

          <button
            type="button"
            className="button saveProgressButton"
            onClick={() => saveProgress()}
          >
            Save Progress
          </button>

          <button type="button" className="button" onClick={preparePowerPointExport}>
            Export as PPTX
          </button>
        </div>
      </section>

      {statusMessage ? (
        <div className={styles.statusBanner}>{statusMessage}</div>
      ) : null}

      <section className={styles.verticalSections}>
        <article className={styles.accordionItem}>
          <button
            type="button"
            className={`${styles.sectionHeader} ${
              activeSection === "export" ? styles.sectionHeaderActive : ""
            }`}
            onClick={() => toggleMainSection("export")}
          >
            <span>1. Export as PPTX</span>
            <strong>
              {activeSection === "export" ? "Collapse" : "Expand"} ·{" "}
              {selectedExportCount}/{exportItems.length} selected
            </strong>
          </button>

          {activeSection === "export" ? (
            <section className={styles.sectionBody}>
              <p className={styles.sectionIntro}>
                Select the final poster sections and additional boxes you want
                to include in the presentation export.
              </p>

              <div className={styles.checkGrid}>
                {exportItems.map((item) => (
                  <label key={item.id} className={styles.checkCard}>
                    <input
                      type="checkbox"
                      checked={item.selected}
                      onChange={() => toggleExportItem(item.id)}
                    />

                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.source}</small>
                    </span>
                  </label>
                ))}
              </div>

              <div className={styles.sectionActions}>
                <button
                  type="button"
                  className="button secondaryButton"
                  onClick={() =>
                    setExportItems((prev) =>
                      prev.map((item) => ({ ...item, selected: true }))
                    )
                  }
                >
                  Select All
                </button>

                <button
                  type="button"
                  className="button secondaryButton"
                  onClick={() =>
                    setExportItems((prev) =>
                      prev.map((item) => ({ ...item, selected: false }))
                    )
                  }
                >
                  Clear
                </button>

                <button
                  type="button"
                  className="button"
                  onClick={preparePowerPointExport}
                >
                  Prepare PPTX Export
                </button>
              </div>
            </section>
          ) : null}
        </article>

        <article className={styles.accordionItem}>
          <button
            type="button"
            className={`${styles.sectionHeader} ${
              activeSection === "script" ? styles.sectionHeaderActive : ""
            }`}
            onClick={() => toggleMainSection("script")}
          >
            <span>2. Script for Pitch</span>
            <strong>
              {activeSection === "script" ? "Collapse" : "Expand"} ·{" "}
              {selectedPitchCount}/{pitchSections.length} included
            </strong>
          </button>

          {activeSection === "script" ? (
            <section className={styles.sectionBody}>
              <p className={styles.sectionIntro}>
                Import and edit the script from the final poster headings. Each
                subsection opens only when clicked.
              </p>

              <div className={styles.pitchList}>
                {pitchSections.map((section) => (
                  <article key={section.id} className={styles.pitchCard}>
                    <div className={styles.pitchHeader}>
                      <label>
                        <input
                          type="checkbox"
                          checked={section.selected}
                          onChange={() => togglePitchSelection(section.id)}
                        />{" "}
                        <strong>{section.title}</strong>
                      </label>

                      <button
                        type="button"
                        className="button secondaryButton"
                        onClick={() => togglePitchOpen(section.id)}
                      >
                        {section.open ? "Hide" : "Open"}
                      </button>
                    </div>

                    {section.open ? (
                      <div className={styles.pitchContent}>
                        {section.content ? (
                          <div className={styles.importedContent}>
                            <strong>Imported poster content</strong>
                            <p>{section.content}</p>
                          </div>
                        ) : null}

                        <label className="fieldLabel">
                          <span>Editable pitch script</span>
                          <textarea
                            rows={6}
                            value={section.script}
                            onChange={(event) =>
                              updatePitch(section.id, event.target.value)
                            }
                          />
                        </label>
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </article>

        <article className={styles.accordionItem}>
          <button
            type="button"
            className={`${styles.sectionHeader} ${
              activeSection === "qa" ? styles.sectionHeaderActive : ""
            }`}
            onClick={() => toggleMainSection("qa")}
          >
            <span>3. Judges Q&amp;A</span>
            <strong>
              {activeSection === "qa" ? "Collapse" : "Expand"} ·{" "}
              {questions.length} questions
            </strong>
          </button>

          {activeSection === "qa" ? (
            <section className={styles.sectionBody}>
              <p className={styles.sectionIntro}>
                Open each question and prepare your own answer. The answer boxes
                are intentionally empty so students actively prepare.
              </p>

              <div className={styles.qaList}>
                {questions.map((question, index) => (
                  <article key={question.id} className={styles.qaCard}>
                    <button
                      type="button"
                      className={styles.qaQuestion}
                      onClick={() => toggleQuestionOpen(question.id)}
                    >
                      <strong>
                        {index + 1}. {question.question}
                      </strong>
                      <span>{question.open ? "Hide" : "Open"}</span>
                    </button>

                    {question.open ? (
                      <textarea
                        rows={5}
                        value={question.answer}
                        onChange={(event) =>
                          updateAnswer(question.id, event.target.value)
                        }
                        placeholder="Prepare your answer here..."
                      />
                    ) : null}
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </article>
      </section>
    </main>
  );
}
