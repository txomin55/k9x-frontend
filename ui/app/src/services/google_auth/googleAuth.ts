import { AppRoutePath } from "@/components/router/paths";
import { resolveAppPath } from "@/utils/routes/app-paths";

export const GOOGLE_OAUTH_STATE_KEY = "k9x_google_oauth_state";
export const GOOGLE_SILENT_OAUTH_MESSAGE_TYPE = "k9x_google_oauth";

const getGoogleRedirectUri = () =>
  import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
  `${globalThis.location.origin}${resolveAppPath(AppRoutePath.HOME)}`;

export const buildGoogleAuthUrl = ({
  prompt,
  state,
}: {
  prompt?: "none" | "select_account";
  state: string;
}) => {
  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirect_uri: getGoogleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
  });

  if (prompt) {
    params.set("prompt", prompt);
  }

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const startGoogleInteractiveLogin = () => {
  const state = crypto.randomUUID();
  globalThis.sessionStorage.setItem(GOOGLE_OAUTH_STATE_KEY, state);
  globalThis.location.assign(
    buildGoogleAuthUrl({ prompt: "select_account", state }),
  );
};

export const getSilentGoogleAuthCode = () =>
  new Promise<string>((resolve, reject) => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      reject(new Error("Missing Google client id"));
      return;
    }

    const state = crypto.randomUUID();
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.setAttribute("aria-hidden", "true");

    const cleanup = (
      timeoutId: ReturnType<typeof globalThis.setTimeout>,
      onMessage: (event: MessageEvent) => void,
    ) => {
      clearTimeout(timeoutId);
      globalThis.removeEventListener("message", onMessage);
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    };

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== globalThis.location.origin) return;

      const data = event.data || {};
      if (data.type !== GOOGLE_SILENT_OAUTH_MESSAGE_TYPE) return;

      const params = new URLSearchParams(data.search || "");
      const returnedState = params.get("state");
      const error = params.get("error");
      const code = params.get("code");

      if (returnedState !== state) {
        cleanup(timeoutId, onMessage);
        reject(new Error("Invalid OAuth state"));
        return;
      }

      if (error) {
        cleanup(timeoutId, onMessage);
        reject(new Error(error));
        return;
      }

      if (!code) {
        cleanup(timeoutId, onMessage);
        reject(new Error("Missing OAuth code"));
        return;
      }

      cleanup(timeoutId, onMessage);
      resolve(code);
    };

    const timeoutId = globalThis.setTimeout(() => {
      cleanup(timeoutId, onMessage);
      reject(new Error("Silent login timeout"));
    }, 10000);

    globalThis.addEventListener("message", onMessage);
    iframe.src = buildGoogleAuthUrl({ prompt: "none", state });
    document.body.appendChild(iframe);
  });
