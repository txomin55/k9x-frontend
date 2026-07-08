import ProfileImage from "@lib/components/molecules/profile-image/ProfileImage";
import { createResource, Show } from "solid-js";
import { useI18n } from "@/stores/i18n/i18n";
import "./styles.css";

const flagLoaders = import.meta.glob<string>("/src/assets/flags/*.svg", {
  eager: false,
  import: "default",
  query: "?url",
});

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
  const loadFlag = () => flagLoaders[`/src/assets/flags/${country()}.svg`];

  const [src] = createResource(loadFlag, (load) => load());

  return (
    <Show
      when={loadFlag()}
      fallback={<span>{i18n.t("COMMON.COUNTRY_FLAG.NA")}</span>}
    >
      <div
        class="country-flag"
        style={{
          height: `${props.height ?? 16}px`,
          width: `${props.width ?? 16}px`,
        }}
      >
        <ProfileImage
          alt={props.alt ?? `${country()} flag`}
          fallback={country().toUpperCase()}
          src={src()}
        />
      </div>
    </Show>
  );
}
