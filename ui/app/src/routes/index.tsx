import {
  createFileRoute,
  Link,
  useLocation,
  useNavigate,
} from "@tanstack/solid-router";
import { createMemo, For, onMount, Show } from "solid-js";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import { useStages } from "@/services/fetch-stages/fetchStages";
import { useI18n } from "@/stores/i18n/i18n";
import "./styles.css";

const CALLBACK_PARAMS_KEY = "k9x_oauth_callback_params";

export const Route = createFileRoute("/")({
  component: EntryRoutePage,
});

function EntryRoutePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const i18n = useI18n();

  const fetchedStages = useStages({
    refetchOnMount: false,
    gcTime: 5 * 60 * 1000,
  });

  const latestStages = createMemo(
    () =>
      fetchedStages.data
        ?.toSorted((left, right) => (right.dateFrom ?? 0) - (left.dateFrom ?? 0))
        .slice(0, 3) ?? [],
  );

  onMount(async () => {
    const search = location().searchStr;

    if (search) {
      const params = new URLSearchParams(search);

      if (params.get("code")) {
        globalThis.sessionStorage.setItem(CALLBACK_PARAMS_KEY, search);
        await navigate({
          to: AppRoutePath.AUTH_CALLBACK as never,
          replace: true,
        });
        return;
      }
    }
  });

  return (
    <section class="landing-page">
      <div class="landing-page__hero">
        <p class="landing-page__eyebrow">{i18n.t("HOME.K9X")}</p>
        <h1>{i18n.t("HOME.STAGE_MANAGEMENT_TITLE")}</h1>
        <p class="landing-page__lead">
          {i18n.t("HOME.STAGE_MANAGEMENT_DESCRIPTION")}
        </p>

        <div class="landing-page__actions">
          <Link
            class="landing-page__action landing-page__action--primary"
            to={AppRoutePath.STAGES as "/stages"}
          >
            {i18n.t("HOME.BROWSE_STAGES")}
          </Link>
        </div>
      </div>

      <Show when={latestStages().length > 0}>
        <div class="landing-page__latest">
          <div class="landing-page__latest-header">
            <h2>{i18n.t("HOME.LATEST_STAGES")}</h2>
            <Link
              class="landing-page__latest-link"
              to={AppRoutePath.STAGES as "/stages"}
            >
              {i18n.t("HOME.BROWSE_STAGES")}
            </Link>
          </div>
          <ul class="landing-page__latest-list">
            <For each={latestStages()}>
              {(stage) => (
                <li class="landing-page__latest-item">
                  <Link
                    class="landing-page__latest-item-link"
                    params={{ id: stage.id }}
                    to="/stages/$id/info"
                  >
                    <CountryFlag
                      country={stage.country ?? ""}
                      alt={`${stage.name} flag`}
                    />
                    <span class="landing-page__latest-name">{stage.name}</span>
                    <span class="landing-page__latest-date">
                      {new Date(stage.dateFrom ?? 0).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              )}
            </For>
          </ul>
        </div>
      </Show>

      <div class="landing-page__grid">
        <article class="landing-page__card">
          <span class="landing-page__card-kicker">{i18n.t("HOME.DISCOVER")}</span>
          <h2>{i18n.t("HOME.PUBLIC_STAGES_TITLE")}</h2>
          <p>
            {i18n.t("HOME.PUBLIC_STAGES_DESCRIPTION")}
          </p>
        </article>

        <article class="landing-page__card">
          <span class="landing-page__card-kicker">{i18n.t("HOME.OPERATE")}</span>
          <h2>{i18n.t("HOME.COMPETITION_TOOLING_TITLE")}</h2>
          <p>
            {i18n.t("HOME.COMPETITION_TOOLING_DESCRIPTION")}
          </p>
        </article>

        <article class="landing-page__card">
          <span class="landing-page__card-kicker">{i18n.t("HOME.OFFLINE_READY")}</span>
          <h2>{i18n.t("HOME.CONNECTIVITY_TITLE")}</h2>
          <p>
            {i18n.t("HOME.CONNECTIVITY_DESCRIPTION")}
          </p>
        </article>
      </div>
    </section>
  );
}
