import { createResource, createSignal, Show } from "solid-js";
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
  const [failed, setFailed] = createSignal(false);

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
        <Show
          when={src() && !failed()}
          fallback={
            <span class="country-flag__fallback">
              {country().toUpperCase()}
            </span>
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
    </Show>
  );
}
