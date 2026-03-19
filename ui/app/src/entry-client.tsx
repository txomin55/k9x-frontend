// @refresh reload
import { mount, StartClient } from "@solidjs/start/client";
import { resolveAppPath } from "@/utils/routes/app-paths";

mount(() => <StartClient />, document.getElementById("app")!);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(resolveAppPath("/sw.js"))
      .catch((error) => {
        console.error("service worker registration failed", error);
      });
  });
}
