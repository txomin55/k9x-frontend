export type IconToggleButtonProps = {
  src: string;
  activeLabel: string;
  inactiveLabel: string;
  active?: boolean;
  disabled?: boolean;
  onToggle?: () => void;
};
