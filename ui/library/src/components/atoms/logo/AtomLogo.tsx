import "./styles.css";

interface Props {
  line1Text: string;
  line2Text: string;
}

export const AtomLogo = ({ line1Text, line2Text }: Props) => (
  <div class="atom-logo">
    <div class="atom-logo__wordmark">
      <span class="atom-logo__k9">K9</span>
      <span class="atom-logo__x">X</span>
    </div>
    <div class="atom-logo__divider" />
    <div class="atom-logo__tagline">
      <span class="atom-logo__tagline--line1">{line1Text}</span>
      <span class="atom-logo__tagline--line2">{line2Text}</span>
    </div>
  </div>
);
