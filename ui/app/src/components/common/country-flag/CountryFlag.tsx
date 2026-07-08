import { createResource, createSignal, Show } from "solid-js";
import "./styles.css";

const flagLoaders = import.meta.glob<string>("/src/assets/flags/*.svg", {
  eager: false,
  import: "default",
  query: "?url",
});

const countryAliases: Record<string, string> = {
  en: "gb",
};

const normalizeCountry = (country?: string) => {
  const normalized = country?.trim().toLowerCase() ?? "";
  return countryAliases[normalized] ?? normalized;
};

export default function CountryFlag(props: {
  alt?: string;
  country?: string;
  height?: number;
  width?: number;
}) {
  const country = () => normalizeCountry(props.country);
  const loadFlag = () =>
    flagLoaders[`/src/assets/flags/${country()}.svg`] ??
    flagLoaders["/src/assets/flags/unknown.svg"];

  const [src] = createResource(loadFlag, (load) => load());
  const [failed, setFailed] = createSignal(false);

  return (
    <div
      class="country-flag"
      style={{
        height: `${props.height ?? 16}px`,
        width: `${props.width ?? 16}px`,
      }}
    >
      <Show
        when={src() && !failed()}
        fallback={
          <span class="country-flag__fallback">{country().toUpperCase()}</span>
        }
      >
        <img
          class="country-flag__img"
          alt={props.alt ?? `${country()} flag`}
          src={src()}
          onError={() => setFailed(true)}
        />
      </Show>
    </div>
  );
}
