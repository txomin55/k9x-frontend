import { createEffect, createSignal, Show } from "solid-js";
import "./styles.css";

const iconLoaders = import.meta.glob<string>("/src/assets/federations/*.png", {
  eager: false,
  import: "default",
  query: "?url",
});

const resolvedIconUrls = new Map<string, string>();

const normalizeFederation = (federation?: string) =>
  federation?.trim().toLowerCase() ?? "";

const iconPath = (federation: string) =>
  `/src/assets/federations/${federation}.png`;

export default function FederationIcon(props: {
  alt?: string;
  federation?: string;
  height?: number;
  width?: number;
}) {
  const federation = () => normalizeFederation(props.federation);
  const hasIcon = () => Boolean(iconLoaders[iconPath(federation())]);

  const [src, setSrc] = createSignal<string | undefined>(
    resolvedIconUrls.get(iconPath(federation())),
  );
  const [failed, setFailed] = createSignal(false);

  createEffect(() => {
    const path = iconPath(federation());
    setFailed(false);

    if (!iconLoaders[path]) {
      setSrc(undefined);
      return;
    }

    const cached = resolvedIconUrls.get(path);
    if (cached) {
      setSrc(cached);
      return;
    }

    setSrc(undefined);
    void iconLoaders[path]?.().then((url) => {
      resolvedIconUrls.set(path, url);
      if (iconPath(federation()) === path) {
        setSrc(url);
      }
    });
  });

  return (
    <div
      class="federation-icon"
      style={{
        height: `${props.height ?? 16}px`,
        width: `${props.width ?? 16}px`,
      }}
    >
      <Show
        when={hasIcon() && src() && !failed()}
        fallback={
          <span class="federation-icon__fallback">
            {federation().toUpperCase()}
          </span>
        }
      >
        <img
          class="federation-icon__img"
          alt={props.alt ?? `${federation()} icon`}
          src={src()}
          onError={() => setFailed(true)}
        />
      </Show>
    </div>
  );
}
