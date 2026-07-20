// @refresh reload
import { BrowserAgent } from "@newrelic/browser-agent/loaders/browser-agent";
import { mount, StartClient } from "@solidjs/start/client";
import { logger } from "@/utils/logger/logger";
import { resolveAppPath } from "@/utils/paths/app-paths";

// The API runs on a different origin (e.g. https://k9x-backend.onrender.com),
// so distributed-tracing headers must be explicitly allowed for it — otherwise
// the browser agent only injects them on same-origin requests.
const apiOrigin = (() => {
  try {
    return new URL(import.meta.env.VITE_APP_API_ADDRESS).origin;
  } catch {
    return undefined;
  }
})();

const options = {
  info: {
    applicationID: "538879164",
    beacon: "bam.eu01.nr-data.net",
    errorBeacon: "bam.eu01.nr-data.net",
    licenseKey: "NRJS-4a4825f1b20435d1672",
    sa: 1,
  },
  init: {
    ajax: {
      deny_list: ["bam.eu01.nr-data.net"],
    },
    browser_consent_mode: {
      enabled: false,
    },
    distributed_tracing: {
      enabled: true,
      // Send both W3C (traceparent/tracestate) and the New Relic header to the
      // backend origin so k9x-backend's APM agent can join the same trace.
      cors_use_tracecontext_headers: true,
      cors_use_newrelic_header: true,
      allowed_origins: apiOrigin ? [apiOrigin] : [],
    },
    performance: {
      capture_detail: false,
      capture_marks: false,
      capture_measures: true,
    },
    privacy: {
      cookies_enabled: true,
    },
  },
  loader_config: {
    accountID: "8305067",
    agentID: "538879164",
    applicationID: "538879164",
    licenseKey: "NRJS-4a4825f1b20435d1672",
    trustKey: "8305067",
  },
};

// The agent loader code executes immediately on instantiation.
new BrowserAgent(options);

window.addEventListener("error", (event) => {
  logger.error(event.error ?? event.message, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

window.addEventListener("unhandledrejection", (event) => {
  logger.error("Unhandled promise rejection", event.reason);
});

mount(() => <StartClient />, document.getElementById("app")!);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(resolveAppPath("/sw.js"))
      .catch((error) => {
        logger.error("service worker registration failed", error);
      });
  });
}
