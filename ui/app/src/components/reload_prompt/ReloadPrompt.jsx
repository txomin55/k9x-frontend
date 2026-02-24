import React, { useEffect } from "react";
import { useAuthentication } from "@/providers/authentication/AuthenticationProvider";
import styles from "./styles.module.css";
import { useNotifications } from "@/providers/notifications/NotificationsProvider.jsx";

const ReloadPrompt = () => {
  const { needRefresh, acceptRefresh, showNotification } = useNotifications();
  const { user } = useAuthentication();
  const showUpdateNotes = user && user.getNews().length > 0;

  useEffect(() => {
    if (needRefresh && !showUpdateNotes) {
      acceptRefresh();
    }
  }, [needRefresh, showUpdateNotes]);

  return (
    <div className={styles.Container}>
      <div className={styles.Toast2}>
        <button className={styles.ToastButton} onClick={showNotification}>
          txomins
        </button>
      </div>
      {needRefresh && showUpdateNotes && (
        <div className={styles.Toast}>
          <div className={styles.Message}>
            <span>{getUser().getNews()}</span>
          </div>
          <button className={styles.ToastButton} onClick={acceptRefresh}>
            Reload
          </button>
          <button className={styles.ToastButton} onClick={close}>
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default ReloadPrompt;
