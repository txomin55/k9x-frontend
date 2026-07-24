import { createSignal, For, Show } from "solid-js";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import bellIcon from "@/assets/miscelaneous/bell.svg";
import {
  markNotificationsAsSeen,
  useNotifications,
} from "@/services/secured/notifications/notifications";
import { formatDateTime } from "@/utils/date";
import { useI18n } from "@/stores/i18n/i18n";

export default function NotificationsDialog() {
  const i18n = useI18n();
  const notificationsQuery = useNotifications();

  const [open, setOpen] = createSignal(false);
  const [unseenOnOpen, setUnseenOnOpen] = createSignal<Set<string>>(new Set());

  const notifications = () => notificationsQuery.data ?? [];
  const hasUnseen = () => notifications().some((notification) => !notification.seen);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);

    if (isOpen) {
      const unseenIds = notifications()
        .filter((notification) => !notification.seen)
        .map((notification) => notification.id);

      setUnseenOnOpen(new Set(unseenIds));
      void markNotificationsAsSeen(unseenIds);
    } else {
      setUnseenOnOpen(new Set<string>());
    }
  };

  return (
    <AtomDialog
      closeButtonText={i18n.t("GLOBAL.APP_LAYOUT.CLOSE_DIALOG")}
      onOpenChange={handleOpenChange}
      open={open()}
      title={i18n.t("GLOBAL.APP_LAYOUT.NOTIFICATIONS_TITLE")}
      trigger={
        <span
          class="notifications-bell"
          classList={{ "notifications-bell--unseen": hasUnseen() }}
          aria-label={i18n.t("GLOBAL.APP_LAYOUT.NOTIFICATIONS_TITLE")}
        >
          <AtomSvgIcon src={bellIcon} tinted />
        </span>
      }
      content={
        <Show
          when={notifications().length}
          fallback={<p>{i18n.t("GLOBAL.APP_LAYOUT.NOTIFICATIONS_EMPTY")}</p>}
        >
          <ul class="notifications-list">
            <For each={notifications()}>
              {(notification) => (
                <li
                  class="notifications-list__item"
                  classList={{
                    "notifications-list__item--unseen": unseenOnOpen().has(
                      notification.id,
                    ),
                  }}
                >
                  <p class="notifications-list__text">{notification.text}</p>
                  <time class="notifications-list__time">
                    {formatDateTime(notification.timestamp)}
                  </time>
                </li>
              )}
            </For>
          </ul>
        </Show>
      }
    />
  );
}
