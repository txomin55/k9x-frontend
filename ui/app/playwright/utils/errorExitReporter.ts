import type { FullResult, Reporter } from "@playwright/test/reporter";

class errorExitReporter implements Reporter {
  onEnd(result: FullResult): void {
    if (result.status === "failed") {
      process.exit(1);
    }
  }
}

export default errorExitReporter;
