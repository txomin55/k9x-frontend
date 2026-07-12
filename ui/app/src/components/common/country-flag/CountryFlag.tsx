import { createEffect, createSignal, Show } from "solid-js";
import "./styles.css";

const flagLoaders = import.meta.glob<string>("/src/assets/flags/*.svg", {
  eager: false,
  import: "default",
  query: "?url",
});

const resolvedFlagUrls = new Map<string, string>();

const countryAliases: Record<string, string> = {
  en: "gb",
};

const normalizeCountry = (country?: string) => {
  const normalized = country?.trim().toLowerCase() ?? "";
  return countryAliases[normalized] ?? normalized;
};

const flagPath = (country: string) =>
  flagLoaders[`/src/assets/flags/${country}.svg`]
    ? `/src/assets/flags/${country}.svg`
    : "/src/assets/flags/unknown.svg";

export default function CountryFlag(props: {
  alt?: string;
  country?: string;
  height?: number;
  width?: number;
}) {
  const country = () => normalizeCountry(props.country);

  const [src, setSrc] = createSignal<string | undefined>(
    resolvedFlagUrls.get(flagPath(country())),
  );
  const [failed, setFailed] = createSignal(false);

  createEffect(() => {
    const path = flagPath(country());
    const cached = resolvedFlagUrls.get(path);

    if (cached) {
      setSrc(cached);
      return;
    }

    setSrc(undefined);
    void flagLoaders[path]?.().then((url) => {
      resolvedFlagUrls.set(path, url);
      if (flagPath(country()) === path) {
        setSrc(url);
      }
    });
  });

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
