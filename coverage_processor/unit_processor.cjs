const path = require("path");
const { mergeFiles } = require("junit-report-merger");

const outputFile = path.join(__dirname, "../.reports/test/unit", "junit.xml");

const inputFiles = [
  "./ui/app/.reports/test/unit/junit.xml",
  "./ui/library/.reports/test/unit/junit.xml",
];

(async () => {
  await mergeFiles(outputFile, inputFiles);
})();
