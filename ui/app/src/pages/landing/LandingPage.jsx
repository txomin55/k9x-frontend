import React, { useState } from "react";
import CoreButton from "@lib/components/atoms/button/CoreButton";
import styles from "./styles.module.css";
import logo from "@/assets/logo.svg";
import { useApi } from "@/providers/api/ApiProvider.jsx";

const OAUTH_STATE_KEY = "k9x_google_oauth_state";

const buildGoogleAuthUrl = () => {
  const redirectUri =
    import.meta.env.VITE_GOOGLE_REDIRECT_URI ||
    `${globalThis.location.origin}/`;

  const state = crypto.randomUUID();
  globalThis.sessionStorage.setItem(OAUTH_STATE_KEY, state);

  const params = new URLSearchParams({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

function LandingPage() {
  const getApi = useApi();
  const api = getApi();
  const { getDogs } = api;
  const [dogsResult, setDogsResult] = useState(null);

  const handleGoogleLogin = () => {
    globalThis.location.assign(buildGoogleAuthUrl());
  };

  const handleLogout = () => {
    globalThis.localStorage.removeItem("k9x_access_token");
  };

  const handleFetchDogs = () => {
    getDogs().then((data) => {
      setDogsResult(data);
    });
  };

  return (
    <div className={styles.LandingPage}>
      <CoreButton label="Haz login con Google" onClick={handleGoogleLogin} />
      <CoreButton label="Logout" onClick={handleLogout} />
      <CoreButton label="Cargar perros" onClick={handleFetchDogs} />

      {dogsResult ? (
        <pre>{JSON.stringify(dogsResult, null, 2)}</pre>
      ) : null}

      <header className={styles.header}>
        <img src={logo} className={styles.logo} alt="logo" />
        <p>
          Edit <code>src/App.jsx</code> and save to reload.
        </p>
        <a
          className={styles.link}
          href="https://github.com/solidjs/solid"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default LandingPage;
