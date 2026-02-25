const libCoverage = require("istanbul-lib-coverage");
const libReport = require("istanbul-lib-report");
const reports = require("istanbul-reports");
const path = require("node:path");

const e2eCoverage = require("../.reports/test/e2e/coverage/coverage-final.json");
const totalUnitCoverage = require("../.reports/test/unit/coverage/coverage-final.json");

const map = libCoverage.createCoverageMap(e2eCoverage);
const summary = libCoverage.createCoverageSummary();

// merge another coverage map into the one we created
map.merge(totalUnitCoverage);

const repoRoot = process.cwd();
const repoName = path.basename(repoRoot);

const normalizeFilePath = (filePath) => {
  if (!filePath) return filePath;
  const normalized = filePath.replace(/\\/g, "/");
  const marker = `/${repoName}/`;
  const idx = normalized.lastIndexOf(marker);
  if (idx !== -1) {
    return normalized.slice(idx + marker.length);
  }

  if (path.isAbsolute(filePath)) {
    const rel = path.relative(repoRoot, filePath);
    if (!rel.startsWith("..") && !path.isAbsolute(rel)) {
      return rel.replace(/\\/g, "/");
    }
  }

  return normalized.replace(/^\.\//, "");
};

const normalizeCoverageMap = (inputMap) => {
  const outputMap = libCoverage.createCoverageMap({});
  inputMap.files().forEach((f) => {
    const fc = inputMap.fileCoverageFor(f);
    const normalizedPath = normalizeFilePath(f);
    const data = fc.toJSON();
    data.path = normalizedPath;
    if (outputMap.files().includes(normalizedPath)) {
      outputMap.fileCoverageFor(normalizedPath).merge(data);
    } else {
      outputMap.addFileCoverage(data);
    }
  });
  return outputMap;
};

const normalizedMap = normalizeCoverageMap(map);

// inspect and summarize all file coverage objects in the map
normalizedMap.files().forEach((f) => {
  const fc = normalizedMap.fileCoverageFor(f),
    s = fc.toSummary();
  summary.merge(s);
});

console.log("E2E summary", summary);

console.log(`Statements : ${summary.data.statements.pct}%`);

const context = libReport.createContext({
  dir: ".reports/test/total/coverage",
  defaultSummarizer: "nested",
  coverageMap: normalizedMap,
  // this is the map which we generated in above snippet
});

// create an instance of the relevant report class, passing the
// report name e.g. json/html/html-spa/text
const report = reports.create("lcov");
const coverageReport = reports.create("cobertura");
const jsonReport = reports.create("json");

// call execute to synchronously create and write the report to disk
report.execute(context);
coverageReport.execute(context);
jsonReport.execute(context);
