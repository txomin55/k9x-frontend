import { Show } from "solid-js";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import { ExtractionSourceDetails } from "@/components/common/extraction-source-banner/ExtractionSourceBanner";
import { currentExtractionNotice } from "@/components/common/extraction-source-banner/extractionNotice";
import { useAuthUser } from "@/stores/auth/auth";
import { useI18n } from "@/stores/i18n/i18n";
import warningIcon from "@/assets/miscelaneous/warning.svg";
import "./styles.css";

export default function ExtractionBreadcrumbNotice() {
  const i18n = useI18n();
  const user = useAuthUser();

  return (
    <Show when={user() && currentExtractionNotice()}>
      {(notice) => (
        <AtomDialog
          closeButtonText={i18n.t("GLOBAL.NAVIGATION.CLOSE_DIALOG")}
          title={i18n.t("COMMON.EXTRACTION_BANNER.MESSAGE_SHORT")}
          trigger={
            <span class="extraction-notice__icon">
              <AtomSvgIcon
                src={warningIcon}
                alt={i18n.t("COMMON.EXTRACTION_BANNER.MESSAGE_SHORT")}
                tinted
              />
            </span>
          }
          content={
            <div class="extraction-notice__content">
              <ExtractionSourceDetails
                extraction={notice().extraction}
                context={notice().context}
              />
            </div>
          }
        />
      )}
    </Show>
  );
}
