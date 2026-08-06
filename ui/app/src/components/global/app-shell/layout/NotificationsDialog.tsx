import { createSignal, For, Show } from "solid-js";
import { useNavigate } from "@tanstack/solid-router";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomButton from "@lib/components/atoms/button/AtomButton";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import bellIcon from "@/assets/miscelaneous/bell.svg";
import {
  markNotificationsAsSeen,
  useNotifications,
} from "@/services/secured/notifications/notifications";
import { formatDateTime } from "@/utils/date";
import { useI18n } from "@/stores/i18n/i18n";
import { renderNotificationWith } from "@/utils/service-worker/events/notification-catalog";
import RichText from "@/components/common/rich-text/RichText";
import type { NotificationResponseDTO } from "@/services/secured/notifications/notifications.types";

export default function NotificationsDialog() {
  const i18n = useI18n();
  const navigate = useNavigate();
  const notificationsQuery = useNotifications();

  // Same title/body the push produces — the catalog is the single source of rendering for both paths.
  const renderContent = (notification: NotificationResponseDTO) =>
    renderNotificationWith(
      notification.type,
      notification.metadata,
      (key, values) => i18n.t(key, values),
    );

  const [open, setOpen] = createSignal(false);
  const [unseenOnOpen, setUnseenOnOpen] = createSignal<Set<string>>(new Set());

  const notifications = () => notificationsQuery.data ?? [];
  const hasUnseen = () =>
    notifications().some((notification) => !notification.seen);

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

  const openNotificationUrl = (url: string) => {
    handleOpenChange(false);
    void navigate({ href: url });
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
          <div class="notifications-dialog">
            <ul class="notifications-list">
              <For each={notifications()}>
                {(notification) => {
                  const content = renderContent(notification);
                  return (
                    <li
                      class="notifications-list__item"
                      classList={{
                        "notifications-list__item--unseen": unseenOnOpen().has(
                          notification.id,
                        ),
                      }}
                    >
                      <span class="text-heading-xs">{content.title}</span>
                      <span class="text-caption-md">
                        <RichText content={content.body} />
                      </span>
                      <time class="text-caption-sm">
                        {formatDateTime(notification.timestamp)}
                      </time>
                      <Show when={content.url}>
                        {(url) => (
                          <div class="notifications-list__item-action">
                            <AtomButton onClick={() => openNotificationUrl(url())}>
                              {i18n.t("NOTIFICATION.REVIEW")}
                            </AtomButton>
                          </div>
                        )}
                      </Show>
                    </li>
                  );
                }}
              </For>
            </ul>
          </div>
        </Show>
      }
    />
  );
}
