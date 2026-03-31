import AtomButton from "@lib/components/atoms/button/AtomButton";
import type { CircleButtonProps } from "@lib/components/molecules/circle-button/CircleButton.types";
import "./styles.css";

export default function CircleButton(props: CircleButtonProps) {
  return (
    <AtomButton class="circle-button" onClick={props.onClick}>
      {props.children}
    </AtomButton>
  );
}
