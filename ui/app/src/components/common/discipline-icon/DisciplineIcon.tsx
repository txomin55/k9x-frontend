import obdxIcon from "@/assets/obdx.svg";
import { useI18n } from "@/stores/i18n/i18n";

const ICON_BY_DISCIPLINE: Record<string, string> = {
  obdx: obdxIcon,
};

const normalizeDiscipline = (disciplineId?: string) =>
  disciplineId?.trim().toLowerCase() ?? "";

export default function DisciplineIcon(props: {
  alt?: string;
  disciplineId?: string;
}) {
  const i18n = useI18n();
  const disciplineId = () => normalizeDiscipline(props.disciplineId);
  const src = () => ICON_BY_DISCIPLINE[disciplineId()];

  if (!src()) {
    return <span>{i18n.t("COMMON.DISCIPLINE_ICON.NA")}</span>;
  }

  return (
    <img
      alt={props.alt ?? `${disciplineId()} icon`}
      class="discipline-icon"
      src={src()}
      style={{ height: "var(--unit-4)", width: "auto" }}
    />
  );
}
