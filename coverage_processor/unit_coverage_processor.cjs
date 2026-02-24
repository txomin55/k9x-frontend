const libCoverage = require("istanbul-lib-coverage");
const libReport = require("istanbul-lib-report");
const reports = require("istanbul-reports");

const libraryUnitCoverage = require("../ui/library/.reports/test/unit/coverage/coverage-final.json");
const appUnitCoverage = require("../ui/app/.reports/test/unit/coverage/coverage-final.json");

const map = libCoverage.createCoverageMap(libraryUnitCoverage);
const summary = libCoverage.createCoverageSummary();

// merge another coverage map into the one we created
map.merge(appUnitCoverage);

// inspect and summarize all file coverage objects in the map
map.files().forEach((f) => {
  const fc = map.fileCoverageFor(f),
    s = fc.toSummary();
  summary.merge(s);
});

console.log("Unit summary", summary);

console.log(`Statements : ${summary.data.statements.pct}%`);

const context = libReport.createContext({
  dir: ".reports/test/unit/coverage",
  defaultSummarizer: "nested",
  coverageMap: map,
  // this is the map which we generated in above snippet
});

// create an instance of the relevant report class, passing the
// report name e.g. json/html/html-spa/text
const lcovReport = reports.create("lcov");
const coberturaReport = reports.create("cobertura");
const jsonReport = reports.create("json");

// call execute to synchronously create and write the report to disk
lcovReport.execute(context);
coberturaReport.execute(context);
jsonReport.execute(context);
