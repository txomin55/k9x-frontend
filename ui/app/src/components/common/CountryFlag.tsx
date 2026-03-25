import ProfileImage from "@lib/components/molecules/profile-image/ProfileImage";
import esFlag from "@/assets/flags/es.svg";
import frFlag from "@/assets/flags/fr.svg";
import gbFlag from "@/assets/flags/gb.svg";
import itFlag from "@/assets/flags/it.svg";
import ptFlag from "@/assets/flags/pt.svg";

const FLAG_BY_COUNTRY: Record<string, string> = {
  es: esFlag,
  fr: frFlag,
  gb: gbFlag,
  it: itFlag,
  pt: ptFlag,
};

const normalizeCountry = (country?: string) => country?.trim().toLowerCase() ?? "";

export default function CountryFlag(props: {
  alt?: string;
  country?: string;
  height?: number;
  width?: number;
}) {
  const country = normalizeCountry(props.country);
  const src = FLAG_BY_COUNTRY[country];

  if (!src) {
    return <span>--N/A</span>;
  }

  return (
    <div
      style={{
        height: `${props.height ?? 18}px`,
        width: `${props.width ?? 24}px`,
      }}
    >
      <ProfileImage
        alt={props.alt ?? `${country} flag`}
        fallback={country.toUpperCase()}
        src={src}
      />
    </div>
  );
}
