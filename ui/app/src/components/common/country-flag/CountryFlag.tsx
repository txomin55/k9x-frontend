import ProfileImage from "@lib/components/molecules/profile-image/ProfileImage";
import esFlag from "@/assets/flags/es.svg";
import frFlag from "@/assets/flags/fr.svg";
import gbFlag from "@/assets/flags/gb.svg";
import itFlag from "@/assets/flags/it.svg";
import ptFlag from "@/assets/flags/pt.svg";
import { useI18n } from "@/stores/i18n/i18n";
import "./styles.css";

const FLAG_BY_COUNTRY: Record<string, string> = {
  es: esFlag,
  fr: frFlag,
  gb: gbFlag,
  it: itFlag,
  pt: ptFlag,
};

const normalizeCountry = (country?: string) =>
  country?.trim().toLowerCase() ?? "";

export default function CountryFlag(props: {
  alt?: string;
  country?: string;
  height?: number;
  width?: number;
}) {
  const i18n = useI18n();
  const country = () => normalizeCountry(props.country);
  const src = () => FLAG_BY_COUNTRY[country()];

  if (!src) {
    return <span>{i18n.t("COMMON.COUNTRY_FLAG.NA")}</span>;
  }

  return (
    <div
      class="country-flag"
      style={{
        height: `${props.height ?? 24}px`,
        width: `${props.width ?? 24}px`,
      }}
    >
      <ProfileImage
        alt={props.alt ?? `${country()} flag`}
        fallback={country().toUpperCase()}
        src={src()}
      />
    </div>
  );
}
