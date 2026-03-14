import path from "node:path";
import { createRequire } from "node:module";
import type { CoverageReportOptions } from "monocart-coverage-reports";

const require = createRequire(import.meta.url);
const MCR =
  require("monocart-coverage-reports") as typeof import("monocart-coverage-reports");

const appRoot = path.resolve(process.cwd());
const uiRoot = path.resolve(appRoot, "..");

const stripSearchAndHash = (inputPath: string) => inputPath.replace(/[?#].*$/, "");

const isTypeScriptFile = (inputPath: string) => {
  const normalizedPath = stripSearchAndHash(inputPath).replaceAll("\\", "/");

  return normalizedPath.endsWith(".ts") || normalizedPath.endsWith(".tsx");
};

const isTestFile = (inputPath: string) => {
  const normalizedPath = stripSearchAndHash(inputPath).replaceAll("\\", "/");

  return (
    normalizedPath.endsWith(".spec.ts") ||
    normalizedPath.endsWith(".spec.tsx") ||
    normalizedPath.endsWith(".test.ts") ||
    normalizedPath.endsWith(".test.tsx")
  );
};

const isTrackedEntryFile = (inputPath: string) => {
  const normalizedPath = stripSearchAndHash(inputPath).replaceAll("\\", "/");

  if (!normalizedPath.includes("/src/") || isTestFile(normalizedPath)) {
    return false;
  }

  return isTypeScriptFile(normalizedPath);
};

const normalizeCoverageSourcePath = (
  inputPath: string,
  info?: {
    distFile?: string;
    url?: string;
  },
) => {
  let normalizedPath = inputPath.replaceAll("\\", "/");

  normalizedPath = stripSearchAndHash(normalizedPath);

  normalizedPath = normalizedPath
    .replace(/^(?:https?:\/\/)?[^/]+\/@fs\//, "/")
    .replace(/^[^/]+\/@fs\//, "/")
    .replace(/^\/@fs\//, "/")
    .replace(/^[\w.-]+-\d+\//, "app/");

  if (path.isAbsolute(normalizedPath)) {
    return path.normalize(normalizedPath);
  }

  if (
    normalizedPath.startsWith("app/") ||
    normalizedPath.startsWith("library/")
  ) {
    return path.resolve(uiRoot, normalizedPath);
  }

  if (normalizedPath.startsWith("src/")) {
    return path.resolve(appRoot, normalizedPath);
  }

  if (info?.distFile && info.url) {
    const distFilePath = normalizeCoverageSourcePath(info.distFile);
    const relativeSourcePath = stripSearchAndHash(info.url).replace(/^\.?\//, "");

    if (path.isAbsolute(distFilePath) && relativeSourcePath) {
      return path.resolve(path.dirname(distFilePath), relativeSourcePath);
    }
  }

  return path.resolve(appRoot, normalizedPath);
};

// https://github.com/cenfun/monocart-coverage-reports
const coverageOptions: CoverageReportOptions = {
  name: "Coverage report",
  sourceMap: true,
  reports: ["text-summary", "markdown-summary", "cobertura", "lcov", "json"],
  entryFilter: (entry) => {
    return isTrackedEntryFile(entry.url);
  },
  sourceFilter: (sourcePath) => {
    return isTypeScriptFile(sourcePath) && !isTestFile(sourcePath);
  },
  outputDir: ".reports/test/e2e/coverage",
  sourcePath: (filePath, info) => {
    return normalizeCoverageSourcePath(filePath, info);
  },
};

const mcr = MCR(coverageOptions);

export const getMCRInstance = () => mcr;
