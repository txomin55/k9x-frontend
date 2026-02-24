import { Button } from "@headlessui/react";
import "./styles.css";

export const BUTTON_TYPES = {
  DEFAULT: "",
  PRIMARY: "primary",
  SECONDARY: "secondary",
  TERTIARY: "tertiary",
  ERROR: "error",
};

const CoreButton = (props) => {
  const disabledStyle = () => (props.disabled ? "disabled" : "");
  const typeStyle = () => props.type ?? BUTTON_TYPES.DEFAULT;

  const clickEvent = (e) => {
    if (!props.disabled) {
      props.onClick(e);
    }
  };

  return (
    <Button
      className={`button ${typeStyle()} ${disabledStyle()}`}
      onClick={clickEvent}
      disabled={props.disabled}
    >
      {props.label}
    </Button>
  );
};

export default CoreButton;
