import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import "./styles.css";
import { FloatingCircleProps } from "@/components/floating_circle/FloatingCircle.types";

export default function FloatingCircle(props: FloatingCircleProps) {
  return (
    <div class="floating-circle">
      <CircleButton onClick={props.onClick}>{props.children}</CircleButton>
    </div>
  );
}
