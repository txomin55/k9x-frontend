// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";
import { logger } from "@/utils/logger/logger";
import { resolveAppPath } from "@/utils/paths/app-paths";

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
