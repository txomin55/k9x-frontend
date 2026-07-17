import { Show } from "solid-js";
import AtomBadge, { BADGE_TYPES } from "@lib/components/atoms/badge/AtomBadge";
import "./styles.css";

export interface RankBadgeProps {
  rank?: string;
}

type StatusConfig = {
  type: (typeof BADGE_TYPES)[keyof typeof BADGE_TYPES];
};

const RANK_CONFIG: Record<string, StatusConfig> = {
  A: { type: BADGE_TYPES.SUCCESS },
  B: { type: BADGE_TYPES.PRIMARY },
  C: { type: BADGE_TYPES.ACCENT },
  D: { type: BADGE_TYPES.WARNING },
  E: { type: BADGE_TYPES.ERROR },
};

export default function RankBadge(props: RankBadgeProps) {
  const letter = () => props.rank?.replaceAll("+", "");
  const hasPlus = () => Boolean(props.rank?.includes("+"));
  const hasPlusPlus = () => Boolean(props.rank?.includes("++"));
  const type = () => {
    const key = letter();
    return key ? RANK_CONFIG[key]?.type : undefined;
  };

  return (
    <Show when={props.rank}>
      <AtomBadge textValue={props.rank} type={type()}>
        <span class="rank-badge__content">
          {letter()}
          <Show when={hasPlus()}>
            <span class="rank-badge__plus">+</span>
          </Show>
          <Show when={hasPlusPlus()}>
            <span class="rank-badge__plus rank-badge__plus--plus">+</span>
          </Show>
        </span>
      </AtomBadge>
    </Show>
  );
}
