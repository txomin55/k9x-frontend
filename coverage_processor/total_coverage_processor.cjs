const libCoverage = require("istanbul-lib-coverage");
const libReport = require("istanbul-lib-report");
const reports = require("istanbul-reports");

const e2eCoverage = require("../.reports/test/e2e/coverage/coverage-final.json");
const totalUnitCoverage = require("../.reports/test/unit/coverage/coverage-final.json");

const map = libCoverage.createCoverageMap(e2eCoverage);
const summary = libCoverage.createCoverageSummary();

// merge another coverage map into the one we created
map.merge(totalUnitCoverage);

// inspect and summarize all file coverage objects in the map
map.files().forEach((f) => {
  const fc = map.fileCoverageFor(f),
    s = fc.toSummary();
  summary.merge(s);
});

console.log("E2E summary", summary);

console.log(`Statements : ${summary.data.statements.pct}%`);

const context = libReport.createContext({
  dir: ".reports/test/total/coverage",
  defaultSummarizer: "nested",
  coverageMap: map,
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
