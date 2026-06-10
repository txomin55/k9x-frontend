import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import { Show } from "solid-js";
import { FloatingToggleProps } from "@/components/common/floating-toggle-circle/FloatingToggleCircle.types";
import "./styles.css";

export default function FloatingToggleCircle(props: FloatingToggleProps) {
  const icon = () => (props.toggled ? props.toggledIcon : props.nonToggledIcon);
  const text = () => (props.toggled ? props.toggledText : props.nonToggledText);

  return (
    <div class="floating-toggle-circle">
      <CircleButton onClick={props.onClick} size="lg">
        <Show when={icon()} fallback={<span>{text()}</span>}>
          <AtomSvgIcon src={icon() ?? ""} alt={text() ?? ""} />
        </Show>
      </CircleButton>
    </div>
  );
}
