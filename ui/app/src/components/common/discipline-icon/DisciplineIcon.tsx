import ProfileImage from "@lib/components/molecules/profile-image/ProfileImage";
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
  height?: number;
  width?: number;
}) {
  const i18n = useI18n();
  const disciplineId = () => normalizeDiscipline(props.disciplineId);
  const src = () => ICON_BY_DISCIPLINE[disciplineId()];

  if (!src()) {
    return <span>{i18n.t("COMMON.DISCIPLINE_ICON.NA")}</span>;
  }

  return (
    <div
      class="discipline-icon"
      style={{
        height: `${props.height ?? 24}px`,
        width: `${props.width ?? 24}px`,
      }}
    >
      <ProfileImage
        alt={props.alt ?? `${disciplineId()} icon`}
        fallback={disciplineId().toUpperCase()}
        src={src()}
      />
    </div>
  );
}
