import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import { FloatingToggleProps } from "@/components/common/floating-toggle-circle/FloatingToggleCircle.types";
import "./styles.css";

export default function FloatingToggleCircle(props: FloatingToggleProps) {
  return (
    <div class="floating-toggle-circle">
      <CircleButton onClick={props.onClick} size="lg">
        {props.toggled ? (
          <span>{props.toggledText}</span>
        ) : (
          <span>{props.nonToggledText}</span>
        )}
      </CircleButton>
    </div>
  );
}
