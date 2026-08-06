import { createSignal } from "solid-js";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import IconToggleButton from "@/components/common/icon-toggle-button/IconToggleButton";
import { updateEventSubscriptions } from "@/services/secured/subscriptions/subscriptions";
import { useAuthUser } from "@/stores/auth/auth";
import { useI18n } from "@/stores/i18n/i18n";
import { startGoogleInteractiveLogin } from "@/utils/google-auth/googleAuth";
import bellIcon from "@/assets/miscelaneous/bell.svg";
import "./styles.css";

export interface StageNotificationsToggleProps {
  eventIds: string[];
}

export default function StageNotificationsToggle(
  props: StageNotificationsToggleProps,
) {
  const i18n = useI18n();
  const user = useAuthUser();
  const [toggling, setToggling] = createSignal(false);
  const [loginDialogOpen, setLoginDialogOpen] = createSignal(false);

  const subscribedEventIds = () => user()?.subscriptions?.eventIds ?? [];

  /** The bell is lit only when every event of the stage is subscribed, since it toggles them all at once. */
  const notificationsEnabled = () =>
    props.eventIds.length > 0 &&
    props.eventIds.every((id) => subscribedEventIds().includes(id));

  const toggleNotifications = () => {
    if (!user()) {
      setLoginDialogOpen(true);
      return;
    }

    if (toggling()) return;

    setToggling(true);
    void updateEventSubscriptions(
      props.eventIds,
      !notificationsEnabled(),
    ).finally(() => setToggling(false));
  };

  return (
    <div class="stage-notifications-toggle">
      <IconToggleButton
        src={bellIcon}
        active={notificationsEnabled()}
        disabled={toggling()}
        activeLabel={i18n.t("STAGES.STAGE_CARD.UNNOTIFY")}
        inactiveLabel={i18n.t("STAGES.STAGE_CARD.NOTIFY")}
        onToggle={toggleNotifications}
      />
      <AtomDialog
        open={loginDialogOpen()}
        onOpenChange={setLoginDialogOpen}
        title={i18n.t("STAGES.NOTIFICATIONS.LOGIN_TITLE")}
        content={
          <div class="stage-notifications-toggle__login">
            <span class="text-body-sm">
              {i18n.t("STAGES.NOTIFICATIONS.LOGIN_DESCRIPTION")}
            </span>
            <AtomButton
              onClick={() => {
                setLoginDialogOpen(false);
                startGoogleInteractiveLogin();
              }}
            >
              {i18n.t("STAGES.NOTIFICATIONS.LOGIN")}
            </AtomButton>
          </div>
        }
      />
    </div>
  );
}
