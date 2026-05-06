import {
  createFileRoute,
  Link,
  useLocation,
  useNavigate,
} from "@tanstack/solid-router";
import { onMount } from "solid-js";
import { AppRoutePath } from "@/components/global/app-shell/paths";
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
