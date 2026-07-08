import { Show } from "solid-js";
import AtomBadge from "@lib/components/atoms/badge/AtomBadge";
import type { RankBadgeProps } from "@/components/common/rank-badge/RankBadge.types";

export default function RankBadge(props: RankBadgeProps) {
  return (
    <Show when={props.rank}>
      <AtomBadge textValue={props.rank}>{props.rank}</AtomBadge>
    </Show>
  );
}
