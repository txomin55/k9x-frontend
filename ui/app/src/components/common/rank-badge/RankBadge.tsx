import { Show } from "solid-js";
import AtomBadge from "@lib/components/atoms/badge/AtomBadge";

export interface RankBadgeProps {
  rank?: string;
}

export default function RankBadge(props: RankBadgeProps) {
  return (
    <Show when={props.rank}>
      <AtomBadge textValue={props.rank}>{props.rank}</AtomBadge>
    </Show>
  );
}
