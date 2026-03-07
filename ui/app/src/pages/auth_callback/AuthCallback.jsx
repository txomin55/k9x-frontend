import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/providers/api/ApiProvider.jsx";
import { useAuthentication } from "@/providers/authentication/AuthenticationProvider.jsx";
import fetchUserData from "@/services/fetch_user_data/fetchUserData.js";
import { ROUTES } from "@/routes/index.js";

const CALLBACK_PARAMS_KEY = "k9x_oauth_callback_params";
const OAUTH_STATE_KEY = "k9x_google_oauth_state";
const SILENT_OAUTH_MESSAGE_TYPE = "k9x_google_oauth";

const readCallbackParams = () => {
  const stored = globalThis.sessionStorage.getItem(CALLBACK_PARAMS_KEY);
  if (stored) {
    globalThis.sessionStorage.removeItem(CALLBACK_PARAMS_KEY);
    return stored;
  }
  return globalThis.location.search;
};

function AuthCallback() {
  const navigate = useNavigate();
  const getApi = useApi();
  const api = getApi();
  const { login, getUserData } = api;
  const { setUser } = useAuthentication();

  const [status, setStatus] = useState("pending");
  const [error, setError] = useState(null);
  const hasProcessed = useRef(false);
  const isIframe =
    globalThis.self && globalThis.top && globalThis.self !== globalThis.top;

  const params = useMemo(() => new URLSearchParams(readCallbackParams()), []);

  useEffect(() => {
    if (isIframe) {
      globalThis.parent.postMessage(
        {
          type: SILENT_OAUTH_MESSAGE_TYPE,
          search: globalThis.location.search,
        },
        globalThis.location.origin,
      );
      return;
    }

    if (hasProcessed.current) return;

    if (globalThis.location.search) {
      const cleanUrl = `${globalThis.location.origin}${globalThis.location.pathname}${globalThis.location.hash}`;
      globalThis.history.replaceState({}, document.title, cleanUrl);
    }

    hasProcessed.current = true;

    const oauthError = params.get("error");
    if (oauthError) {
      setStatus("error");
      setError(oauthError);
      return;
    }

    const code = params.get("code");
    const returnedState = params.get("state");
    const expectedState = globalThis.sessionStorage.getItem(OAUTH_STATE_KEY);

    if (!code) {
      setStatus("missing_code");
      return;
    }

    if (!expectedState || returnedState !== expectedState) {
      setStatus("state_mismatch");
      return;
    }

    setStatus("loading");

    login(null, { idToken: code })
      .then((token) => {
        globalThis.localStorage.setItem("k9x_access_token", token);

        return fetchUserData(getUserData, (d) => {
          setUser(d);
        });
      })
      .then(() => {
        globalThis.sessionStorage.removeItem(OAUTH_STATE_KEY);
        navigate(ROUTES.HOME, { replace: true });
      })
      .catch((e) => {
        setStatus("error");
        setError(e?.message || "Login failed");
      });
  }, [params, login, getUserData, setUser, navigate, isIframe]);

  if (status === "loading" || status === "pending") {
    return <p>Autenticando con Google...</p>;
  }

  if (status === "state_mismatch") {
    return <p>Estado OAuth invalido. Reintenta el login</p>;
  }

  if (status === "missing_code") {
    return <p>No se recibio el codigo de autenticacion.</p>;
  }

  if (status === "error") {
    return <p>Error de autenticacion: {String(error)}</p>;
  }

  return <p>Autenticado. Redirigiendo...</p>;
}

export default AuthCallback;
