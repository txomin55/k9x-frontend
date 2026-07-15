import { Show } from "solid-js";
import AtomBadge from "@lib/components/atoms/badge/AtomBadge";
import "./styles.css";

export interface RankBadgeProps {
  rank?: string;
}

export default function RankBadge(props: RankBadgeProps) {
  const letter = () => props.rank?.replace("+", "");
  const hasPlus = () => Boolean(props.rank?.includes("+"));

  return (
    <Show when={props.rank}>
      <AtomBadge textValue={props.rank}>
        <span class="rank-badge__content">
          {letter()}
          <Show when={hasPlus()}>
            <span class="rank-badge__plus">+</span>
          </Show>
        </span>
      </AtomBadge>
    </Show>
  );
}