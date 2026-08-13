import { Show } from "solid-js";
import {
  AtomCombobox,
  type AtomComboboxOption,
} from "@lib/components/atoms/combobox/AtomCombobox";
import AtomSelect, {
  type AtomSelectOption,
} from "@lib/components/atoms/select/AtomSelect";
import RotateDeviceHint from "@/components/common/rotate-device-hint/RotateDeviceHint";
import { useI18n } from "@/stores/i18n/i18n";
import { useAuthUser } from "@/stores/auth/auth";
import { useDeviceType } from "@/utils/media-query/useDeviceType";
import "@/components/routes/stages/$id/events/$eventId/classification-filters/styles.css";

type ClassificationFiltersProps = {
  competitorOptions: AtomComboboxOption[];
  selectedCompetitorOptions: AtomComboboxOption[];
  onCompetitorsChange: (ids: string[]) => void;
  sortOptions: AtomSelectOption[];
  selectedSortOption?: AtomSelectOption;
  onSortChange: (value?: string) => void;
};

export default function ClassificationFilters(
  props: ClassificationFiltersProps,
) {
  const { t } = useI18n();
  const user = useAuthUser();
  const device = useDeviceType();

  const isMobile = () => device() === "mobile";
  const isVisible = () => Boolean(user()) && props.competitorOptions.length > 0;

  return (
    <Show when={isVisible()}>
      <div
        class="obdx-clf__filter"
        classList={{ "obdx-clf__filter-row": !isMobile() }}
      >
        <AtomCombobox
          multiple
          label={t("STAGES.CLASSIFICATION.FILTER_COMPETITORS")}
          placeholder={t(
            "STAGES.CLASSIFICATION.FILTER_COMPETITORS_PLACEHOLDER",
          )}
          options={props.competitorOptions}
          value={props.selectedCompetitorOptions}
          onChange={(options) =>
            props.onCompetitorsChange(options.map((option) => option.value))
          }
        />
        <AtomSelect
          label={t("STAGES.CLASSIFICATION.SORT_BY")}
          options={props.sortOptions}
          value={props.selectedSortOption}
          onChange={(option) => props.onSortChange(option?.value)}
        />
        <Show when={!isMobile()}>
          <RotateDeviceHint />
        </Show>
      </div>
    </Show>
  );
}
