import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";
import {Show, type JSX} from "solid-js";
import "./styles.css";

export interface FloatingToggleProps {
  onClick?: JSX.EventHandler<HTMLButtonElement, MouseEvent>;
  toggled?: boolean;
  nonToggledText: string;
  toggledText?: string;
  nonToggledIcon?: string;
  toggledIcon?: string;
}

export default function FloatingToggleCircle(props: FloatingToggleProps) {
  const icon = () => (props.toggled ? props.toggledIcon : props.nonToggledIcon);
  const text = () => (props.toggled ? props.toggledText : props.nonToggledText);

  return (
    <div class="floating-toggle-circle">
      <CircleButton onClick={props.onClick} size="md">
        <Show when={icon()} fallback={<span>{text()}</span>}>
          <AtomSvgIcon src={icon() ?? ""} alt={text() ?? ""} tinted />
        </Show>
      </CircleButton>
    </div>
  );
}
