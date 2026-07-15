import AtomBadge, { BADGE_TYPES } from "@lib/components/atoms/badge/AtomBadge";
import { useI18n } from "@/stores/i18n/i18n";

export interface StatusBadgeProps {
  status: string;
  dotMode?: boolean;
}

type StatusConfig = {
  type?: (typeof BADGE_TYPES)[keyof typeof BADGE_TYPES];
  pulse?: boolean;
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
  CREATED: { type: BADGE_TYPES.PRIMARY },
  CLOSED_ENROLLMENT: { type: BADGE_TYPES.WARNING },
  TO_START: { type: BADGE_TYPES.WARNING, pulse: true },
  STARTED: { type: BADGE_TYPES.SUCCESS, pulse: true },
  OPEN: { type: BADGE_TYPES.SUCCESS, pulse: true },
  FINISHED: { type: BADGE_TYPES.ACCENT },
  DELETED: { type: BADGE_TYPES.ERROR },
};

export default function StatusBadge(props: StatusBadgeProps) {
  const i18n = useI18n();

  const key = () => props.status.toUpperCase();
  const config = () => STATUS_CONFIG[key()] ?? {};
  const label = () => i18n.t(`COMMON.STATUS.${key()}`);

  return (
    <AtomBadge
      type={config().type}
      pulse={config().pulse}
      dotMode={props.dotMode}
      textValue={label()}
    >
      {label()}
    </AtomBadge>
  );
}
