import type { CoreSvgIconProps } from "@lib/components/atoms/svg-icon/AtomSvgIcon.types";

export default function AtomSvgIcon(props: CoreSvgIconProps) {
  return <img src={props.src} alt={props.alt ?? ""} />;
}
