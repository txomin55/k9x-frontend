import { useAuthentication } from "@/providers/authentication/AuthenticationProvider";
import { useI18n } from "@/providers/i18n/I18nProvider.jsx";
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { ROUTES } from "@/routes/index.js";
import CoreButton from "@lib/components/atoms/button/CoreButton.jsx";

const CALLBACK_PARAMS_KEY = "k9x_oauth_callback_params";

function App({ children }) {
  const { t, locale, setLocale, locales } = useI18n();

  const { user } = useAuthentication();

  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!globalThis.location.search) return;
    const params = new URLSearchParams(globalThis.location.search);
    if (!params.get("code") && !params.get("error")) return;

    globalThis.sessionStorage.setItem(
      CALLBACK_PARAMS_KEY,
      globalThis.location.search,
    );
    navigate(ROUTES.AUTH_CALLBACK, { replace: true });
  }, [navigate]);

  const toggleMode = () => {
    if (isDark) {
      document.body.classList.remove("dark");
    } else {
      document.body.classList.add("dark");
    }

    setIsDark(!isDark);
  };

  return (
    <div>
      <h1>My REACT PWA</h1>
      {t("hello", { name: "txomin" })}
      <h2>USER -- {user ? user.getOwner() : "--NO"}</h2>
      <p>Mode</p>
      <CoreButton
        type="tertiary"
        onClick={() => toggleMode()}
        label={isDark ? "Light" : "Dark"}
      />
      <p>LOCALES</p>
      <p>locale - {locale}</p>
      <div>
        {locales.map((l) => (
          <CoreButton
            type="primary"
            key={l}
            onClick={() => setLocale(l)}
            label={l}
          />
        ))}
      </div>
      <nav>
        <Link to={ROUTES.LANDING}>Landing</Link>
        <Link to={ROUTES.HOME}>Home</Link>
      </nav>
      <div>{children}</div>
    </div>
  );
}

export default App;
