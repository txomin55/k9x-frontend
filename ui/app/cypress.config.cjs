const fs = require("fs");
const path = require("path");
const url = require("url");
const v8toIstanbul = require("v8-to-istanbul");
const glob = require("glob");

const { defineConfig } = require("cypress");

const V8_COVERAGE_FOLDER = ".cypress_v8_coverage";
const NYC_OUTPUT_FOLDER = ".nyc_output";
const NYC_COVERAGE_PATH = `${NYC_OUTPUT_FOLDER}/final.json`;
const CYPRESS_ISTANBUL_COVERAGE_PATH = ".reports/test/e2e/coverage/coverage-final.json";

const cypressConfig = defineConfig({
  projectId: process.env.CY_PROJECT_ID,
  fixturesFolder: "tests/e2e/test-results/fixtures",
  reporter: "cypress-multi-reporters",
  reporterOptions: {
    reporterEnabled: "mocha-junit-reporter",
    mochaJunitReporterReporterOptions: {
      mochaFile: ".reports/cypress/junit.xml",
      toConsole: false,
    },
  },
  e2e: {
    baseUrl: process.env.PWA_PRO_URL ?? "http://localhost:3000",
    specPattern: "tests/e2e/specs/**/*.js",
    supportFile: "tests/e2e/support/index.js",
    screenshotsFolder: "cypress/screenshots",
    videosFolder: "cypress/videos",
    setupNodeEvents(on, config) {
      if (process.env.VITE_APP_IS_E2E) {
        process.env.CYPRESS_CDP_COVERAGE = V8_COVERAGE_FOLDER;

        if (fs.existsSync(process.env.CYPRESS_CDP_COVERAGE)) {
          fs.rm(
            process.env.CYPRESS_CDP_COVERAGE,
            { recursive: true, force: true },
            (err) => {
              if (err) {
                throw err;
              }
            },
          );
        }

        if (fs.existsSync(NYC_OUTPUT_FOLDER)) {
          fs.rm(NYC_OUTPUT_FOLDER, { recursive: true, force: true }, (err) => {
            if (err) {
              throw err;
            }
          });
        }

        require("cypress-cdp-coverage/plugin")(on, config);

        // include any other plugin code...

        // It's IMPORTANT to return the config object
        // with any changed environment variables
        on("after:run", async (results) => {
          let v8Coverage;

          glob
            .sync(process.cwd() + `/${process.env.CYPRESS_CDP_COVERAGE}/`)
            .forEach((item) => {
              const directory = fs.opendirSync(item);
              let file;
              while ((file = directory.readSync()) !== null) {
                if (file && file.name.includes(".json") === true) {
                  const fileName = file.name;
                  if (fileName) {
                    v8Coverage = require(
                      `${process.cwd()}/${
                        process.env.CYPRESS_CDP_COVERAGE
                      }/${fileName}`,
                    );
                  }
                }
              }
              directory.closeSync();
            });

          const codebaseResults = v8Coverage.result.filter((r) =>
            r.url.match(
              /^http:\/\/localhost:3000\/src\/(?:[^/]+\/)*[^/]+(?<!\.(stories|test))\.js(x)?$/,
            ),
          );

          const totalCoverage = {};
          for (const report of codebaseResults) {
            // console.log('report is %o', report)
            const u = new url.URL(report.url);
            const filename = path.join(__dirname, u.pathname);

            const converter = v8toIstanbul(filename);
            // I wonder if this maps the source if there is a source map?!
            await converter.load();
            converter.applyCoverage(report.functions);

            const elementCoverage = converter.toIstanbul();
            totalCoverage[Object.keys(elementCoverage)[0]] =
              Object.values(elementCoverage)[0];
          }

          const stringifyTotalCoverage = JSON.stringify(totalCoverage, null, 2);
          fs.mkdirSync(path.dirname(CYPRESS_ISTANBUL_COVERAGE_PATH), {
            recursive: true,
          });
          fs.writeFileSync(
            CYPRESS_ISTANBUL_COVERAGE_PATH,
            stringifyTotalCoverage,
          );

          fs.mkdirSync(NYC_OUTPUT_FOLDER, { recursive: true });
          fs.writeFileSync(NYC_COVERAGE_PATH, stringifyTotalCoverage);

          // /!\ don't forget to return the Promise /!\
          return require("cypress-sonarqube-reporter/mergeReports")(results, {
            // see "Merge Plugin Options" section for all available options
            reportsOutputDir: ".reports/tests/e2e/sonar",
            mergeOutputDir: ".reports/tests/e2e/sonar",
            mergeFileName: "cypress-unit-report.xml",
          });
        });
      }

      return config;
    },
  },
  chromeWebSecurity: false,
});

if (process.env.VITE_APP_IS_E2E) {
  cypressConfig.reporterOptions = {
    reporterEnabled: `cypress-sonarqube-reporter, ${cypressConfig.reporterOptions.reporterEnabled}`,
    cypressSonarqubeReporterReporterOptions: {
      outputDir: ".reports/sonar/e2e",
      overwrite: true,
    },
    mochaJunitReporterReporterOptions:
      cypressConfig.reporterOptions.mochaJunitReporterReporterOptions,
  };
}

module.exports = cypressConfig;
