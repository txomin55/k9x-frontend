import { Show } from "solid-js";
import { useI18n } from "@/stores/i18n/i18n";
import type { TotalBlockProps } from "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/atoms/total-block/TotalBlock.types";
import "@/components/routes/stages/$id/events/$eventId/obdx/classification-card/styles.css";

export default function TotalBlock(props: TotalBlockProps) {
  const { t } = useI18n();

  return (
    <div
      class="obdx-clf__total"
      classList={{
        "obdx-clf__total--inline": props.layout === "inline",
        "obdx-clf__total--row": props.layout === "row",
      }}
    >
      <span class="obdx-clf__total-label">
        {t("STAGES.CLASSIFICATION_CARD.TOTAL")}
      </span>
      <span class="obdx-clf__total-value text-heading-sm">
        {props.value === null ? "—" : props.value}
        <Show when={props.qualification}>
          <span class="obdx-clf__qualification text-caption-sm">
            {props.qualification}
          </span>
        </Show>
      </span>
    </div>
  );
}
