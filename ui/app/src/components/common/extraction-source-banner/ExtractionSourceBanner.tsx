import { createSignal, Show } from "solid-js";
import AtomCollapsible from "@lib/components/atoms/collapsible/AtomCollapsible";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import type { ExtractionResponseDTO } from "@/services/fetch-stages/fetchStages.types";
import ExtractionReportForm from "@/components/common/extraction-source-banner/ExtractionReportForm";
import { useAuthUser } from "@/stores/auth/auth";
import { useI18n } from "@/stores/i18n/i18n";
import { formatUtcDateOnly } from "@/utils/date";
import "./styles.css";

export interface ExtractionSourceBannerProps {
  /** Provenance of the competition the view belongs to; the banner only renders when there is one. */
  extraction?: ExtractionResponseDTO;
  /** Competition, trial or event name, shown in the report dialog so it says what is being reported. */
  context?: string;
}

export default function ExtractionSourceBanner(
  props: ExtractionSourceBannerProps,
) {
  const i18n = useI18n();
  const user = useAuthUser();

  const [reportOpen, setReportOpen] = createSignal(false);
  // Per-instance and not persisted: collapsing is about the screen in front of the reader, and the warning
  // is worth showing again the next time they open a view built on extracted data.
  const [open, setOpen] = createSignal(false);

  const hint = () => props.extraction?.hint;
  const url = () => props.extraction?.source?.url;
  const collectedAt = () => props.extraction?.source?.extractionTimestamp;

  const provenance = () => (
    <Show when={hint() || url() || collectedAt()}>
      <div class="extraction-banner__provenance">
        <Show when={hint()}>
          <span class="extraction-banner__hint text-caption-md">{hint()}</span>
        </Show>
        <Show when={collectedAt()}>
          <span class="extraction-banner__collected text-caption-sm">
            {i18n.t("COMMON.EXTRACTION_BANNER.COLLECTED_AT", {
              date: formatUtcDateOnly(collectedAt() as number),
            })}
          </span>
        </Show>
        <Show when={url() && url() !== "-"}>
          <a
            class="extraction-banner__source text-caption-sm"
            href={url()}
            rel="noreferrer noopener"
            target="_blank"
          >
            {i18n.t("COMMON.EXTRACTION_BANNER.SOURCE_LINK")}
          </a>
        </Show>
      </div>
    </Show>
  );

  const body = () => (
    <div class="extraction-banner__body">
      <span class="extraction-banner__message text-caption-md">
        {i18n.t("COMMON.EXTRACTION_BANNER.MESSAGE")}
      </span>
      {provenance()}
      <AtomDialog
        closeButtonText={i18n.t("GLOBAL.NAVIGATION.CLOSE_DIALOG")}
        content={
          <ExtractionReportForm
            context={props.context ?? ""}
            extractionId={props.extraction?.extractionId ?? ""}
            onClose={() => setReportOpen(false)}
          />
        }
        onOpenChange={setReportOpen}
        open={reportOpen()}
        title={i18n.t("COMMON.EXTRACTION_BANNER.REPORT")}
        triggerClass="extraction-banner__trigger"
        trigger={<span>{i18n.t("COMMON.EXTRACTION_BANNER.REPORT")}</span>}
      />
    </div>
  );

  return (
    <Show when={Boolean(props.extraction) && Boolean(user())}>
      <div class="extraction-banner extraction-banner--collapsible">
        <AtomCollapsible
          size="sm"
          open={open()}
          onOpenChange={setOpen}
          trigger={
            <span class="text-caption-md">
              {i18n.t("COMMON.EXTRACTION_BANNER.MESSAGE_SHORT")}
            </span>
          }
          content={body()}
        />
      </div>
    </Show>
  );
}
