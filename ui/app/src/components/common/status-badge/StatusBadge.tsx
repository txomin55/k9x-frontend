import AtomBadge, { BADGE_TYPES } from "@lib/components/atoms/badge/AtomBadge";
import { useI18n } from "@/stores/i18n/i18n";
import type { StatusBadgeProps } from "@/components/common/status-badge/StatusBadge.types";

type StatusConfig = {
  type?: (typeof BADGE_TYPES)[keyof typeof BADGE_TYPES];
  pulse?: boolean;
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
  CREATED: {},
  CLOSED_ENROLLMENT: { type: BADGE_TYPES.WARNING },
  TO_BE_STARTED: { type: BADGE_TYPES.WARNING, pulse: true },
  STARTED: { type: BADGE_TYPES.SUCCESS, pulse: true },
  COMPLETED: {},
  DELETED: { type: BADGE_TYPES.ERROR },
};

export default function StatusBadge(props: StatusBadgeProps) {
  const i18n = useI18n();

  const key = () => props.status.toUpperCase();
  const config = () => STATUS_CONFIG[key()] ?? {};
  const label = () => i18n.t(`COMMON.STATUS.${key()}`);

  return (
    <AtomBadge type={config().type} pulse={config().pulse} textValue={label()}>
      {label()}
    </AtomBadge>
  );
}
