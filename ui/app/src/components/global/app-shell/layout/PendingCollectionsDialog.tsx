import { createEffect, createSignal } from "solid-js";
import { useNavigate } from "@tanstack/solid-router";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import { useCollections } from "@/services/secured/collection-crud/collectionCrud";
import { isOffline } from "@/utils/local-first/localFirstPolicy";
import { useI18n } from "@/stores/i18n/i18n";

export default function PendingCollectionsDialog() {
  const i18n = useI18n();
  const navigate = useNavigate();
  const collectionsQuery = useCollections({ refetchOnMount: !isOffline() });

  const [open, setOpen] = createSignal(false);
  const [dismissed, setDismissed] = createSignal(false);

  createEffect(() => {
    if (!dismissed() && collectionsQuery.data?.length) {
      setOpen(true);
    }
  });

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setDismissed(true);
    }
  };

  const goToCollections = () => {
    handleOpenChange(false);
    void navigate({ to: AppRoutePath.MY_COLLECTIONS as never });
  };

  return (
    <AtomDialog
      closeButtonText={i18n.t("GLOBAL.APP_LAYOUT.CLOSE_DIALOG")}
      onOpenChange={handleOpenChange}
      open={open()}
      title={i18n.t("GLOBAL.APP_LAYOUT.PENDING_COLLECTIONS_TITLE")}
      content={
        <>
          <p>{i18n.t("GLOBAL.APP_LAYOUT.PENDING_COLLECTIONS_MESSAGE")}</p>
          <AtomButton type={BUTTON_TYPES.ACCENT} onClick={goToCollections}>
            {i18n.t("GLOBAL.APP_LAYOUT.GO_TO_COLLECTIONS")}
          </AtomButton>
        </>
      }
    />
  );
}
