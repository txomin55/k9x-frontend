import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import { FloatingToggleProps } from "@/components/floating-toggle-circle/FloatingToggleCircle.types";
import "./styles.css";

export default function FloatingToggleCircle(props: FloatingToggleProps) {
  return (
    <div class="floating-toggle-circle">
      <CircleButton onClick={props.onClick}>
        {props.toggled ? (
          <span>{props.toggledText}</span>
        ) : (
          <span>{props.nonToggledText}</span>
        )}
      </CircleButton>
    </div>
  );
}
