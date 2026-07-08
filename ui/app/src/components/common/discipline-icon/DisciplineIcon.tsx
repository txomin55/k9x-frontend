import { Show } from "solid-js";

import obdxIcon from "@/assets/disciplines/obdx.svg";
import { useI18n } from "@/stores/i18n/i18n";
import { DISCIPLINES } from "@/utils/disciplines";

const ICON_BY_DISCIPLINE: Record<string, string> = {
  [DISCIPLINES.OBDX]: obdxIcon,
};

const normalizeDiscipline = (disciplineId?: string) => disciplineId ?? "";

export default function DisciplineIcon(props: {
  alt?: string;
  disciplineId?: string;
}) {
  const i18n = useI18n();
  const disciplineId = () => normalizeDiscipline(props.disciplineId);
  const src = () => ICON_BY_DISCIPLINE[disciplineId()];

  return (
    <Show
      when={src()}
      fallback={<span>{i18n.t("COMMON.DISCIPLINE_ICON.NA")}</span>}
    >
      <img
        alt={props.alt ?? `${disciplineId()} icon`}
        class="discipline-icon"
        src={src()}
        style={{ height: "var(--unit-4)", width: "var(--unit-4)" }}
      />
    </Show>
  );
}
