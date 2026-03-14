export type CoreSvgIconProps = {
  alt?: string;
  src: string;
};

export default function CoreSvgIcon(props: CoreSvgIconProps) {
  return <img src={props.src} alt={props.alt ?? ""} />;
}
