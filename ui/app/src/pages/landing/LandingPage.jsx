import React, { useEffect, useState } from "react";
import CoreButton from "@lib/components/atoms/button/CoreButton";
import styles from "./styles.module.css";
import logo from "@/assets/logo.svg";
import { useApi } from "@/providers/api/ApiProvider.jsx";

function LandingPage() {
  const getApi = useApi();

  const [buttonLabel, setButtonLabel] = useState("Haz login con google");
  const [disabledButton, setDisabledButton] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setButtonLabel("Cambiado");
      setDisabledButton(true);
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className={styles.LandingPage}>
      <CoreButton label={buttonLabel} disabled={disabledButton} />

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
