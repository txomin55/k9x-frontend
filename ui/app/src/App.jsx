import { useAuthentication } from "@/providers/authentication/AuthenticationProvider";
import { useI18n } from "@/providers/i18n/I18nProvider.jsx";
import { useApi } from "@/providers/api/ApiProvider.jsx";
import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import doLogin from "@/services/do_login/doLogin.js";
import fetchUserData from "@/services/fetch_user_data/fetchUserData.js";
import { ROUTES } from "@/routes/index.js";
import CoreButton from "@lib/components/atoms/button/CoreButton.jsx";

function App({ children }) {
  const { t, locale, setLocale, locales } = useI18n();

  const getApi = useApi();
  const { login, getUserData } = getApi();
  const { setUser, user } = useAuthentication();

  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (window.location.search !== "") {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      if (code !== "") {
        doLogin(
          () => login(null, { code }),
          () => {
            fetchUserData(getUserData, (d) => {
              setUser(d);
              navigate(ROUTES.HOME);
            });
          },
        );
      }
    }
  }, [login, getUserData, setUser, navigate]);

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
