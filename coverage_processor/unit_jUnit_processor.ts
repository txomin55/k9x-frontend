import path from "node:path";
import { fileURLToPath } from "node:url";
import { mergeFiles } from "junit-report-merger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputFile = path.join(__dirname, "../.reports/test/unit", "junit.xml");

const inputFiles = [
  "./ui/app/.reports/test/unit/junit.xml",
  "./ui/library/.reports/test/unit/junit.xml",
];

(async () => {
  await mergeFiles(outputFile, inputFiles);
})();
