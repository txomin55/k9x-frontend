import { createFileRoute, Link, useLocation, useNavigate } from "@tanstack/solid-router";
import {
  createMemo,
  createSignal,
  For,
  onMount,
  Show,
  Suspense,
} from "solid-js";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import StatusBadge from "@/components/common/status-badge/StatusBadge";
import { useStages } from "@/services/fetch-stages/fetchStages";
import { useI18n } from "@/stores/i18n/i18n";
import ContactForm from "@/components/global/app-shell/layout/navigation/ContactForm";
import AtomButton, { BUTTON_TYPES } from "@lib/components/atoms/button/AtomButton";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";
import { AtomLogo } from "@lib/components/atoms/logo/AtomLogo";
import { isStageLive } from "@/utils/stage";
import { isOffline } from "@/utils/local-first/localFirstPolicy";
import { formatUtcDateOnly } from "@/utils/date";
import "./styles.css";

const CALLBACK_PARAMS_KEY = "k9x_oauth_callback_params";

export const Route = createFileRoute("/")({
  component: EntryRoutePage,
});

function LatestStagesSkeleton(props: { title: string }) {
  return (
    <div class="landing-page__latest">
      <div class="landing-page__latest-header">
        <span class="landing-page__latest-title">{props.title}</span>
      </div>
      <ul class="landing-page__latest-list">
        <For each={Array.from({ length: 3 })}>
          {() => (
            <li class="landing-page__latest-item">
              <div class="landing-page__latest-item-link">
                <AtomSkeleton
                  variant="rectangular"
                  width="60%"
                  height="calc(var(--unit-2) + var(--unit-025))"
                />
              </div>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}

function LatestStages() {
  const i18n = useI18n();

  const fetchedStages = useStages({
    refetchOnMount: !isOffline(),
    gcTime: 5 * 60 * 1000,
  });

  const latestStages = createMemo(
    () =>
      fetchedStages.data
        ?.toSorted(
          (left, right) => (right.dateFrom ?? 0) - (left.dateFrom ?? 0),
        )
        .slice(0, 3) ?? [],
  );

  return (
    <Show when={latestStages().length > 0}>
      <div class="landing-page__latest">
        <div class="landing-page__latest-header">
          <span class="landing-page__latest-title">
            {i18n.t("HOME.LATEST_STAGES")}
          </span>
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
                  <div class="landing-page__summary">
                    <CountryFlag
                      country={stage.country ?? ""}
                      alt={`${stage.name} flag`}
                    />
                    <span class="landing-page__latest-name">{stage.name}</span>
                    <Show when={stage.status && isStageLive(stage.status)}>
                      <StatusBadge status={stage.status!} dotMode />
                    </Show>
                  </div>
                  <span class="landing-page__latest-date">
                    {formatUtcDateOnly(stage.dateFrom ?? 0)}
                  </span>
                </Link>
              </li>
            )}
          </For>
        </ul>
      </div>
    </Show>
  );
}

function EntryRoutePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const i18n = useI18n();

  const [openGenericContactForm, setOpenGenericContactForm] =
    createSignal(false);

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
      <AtomLogo
        line1Text={i18n.t("HOME.LOGO.LINE1")}
        line2Text={i18n.t("HOME.LOGO.LINE2")}
      />

      <div class="landing-page__hero">
        <span class="text-heading-lg">
          {i18n.t("HOME.STAGE_MANAGEMENT_TITLE")}
        </span>
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

      <Suspense
        fallback={<LatestStagesSkeleton title={i18n.t("HOME.LATEST_STAGES")} />}
      >
        <LatestStages />
      </Suspense>

      <div class="landing-page__grid">
        <article class="landing-page__card">
          <span class="landing-page__card-kicker">
            {i18n.t("HOME.DISCOVER")}
          </span>
          <span class="landing-page__card-title">
            {i18n.t("HOME.PUBLIC_STAGES_TITLE")}
          </span>
          <p>{i18n.t("HOME.PUBLIC_STAGES_DESCRIPTION")}</p>
        </article>

        <article class="landing-page__card">
          <span class="landing-page__card-kicker">
            {i18n.t("HOME.OPERATE")}
          </span>
          <span class="landing-page__card-title">
            {i18n.t("HOME.COMPETITION_TOOLING_TITLE")}
          </span>
          <p>{i18n.t("HOME.COMPETITION_TOOLING_DESCRIPTION")}</p>
        </article>

        <article class="landing-page__card">
          <span class="landing-page__card-kicker">
            {i18n.t("HOME.OFFLINE_READY")}
          </span>
          <span class="landing-page__card-title">
            {i18n.t("HOME.CONNECTIVITY_TITLE")}
          </span>
          <p>{i18n.t("HOME.CONNECTIVITY_DESCRIPTION")}</p>
        </article>
      </div>

      <AtomDialog
        closeButtonText={i18n.t("GLOBAL.NAVIGATION.CLOSE_DIALOG")}
        content={
          <ContactForm onClose={() => setOpenGenericContactForm(false)} />
        }
        onOpenChange={setOpenGenericContactForm}
        open={openGenericContactForm()}
        title={i18n.t("GLOBAL.NAVIGATION.CONTACT_US")}
        trigger={
          <AtomButton type={BUTTON_TYPES.GHOST}>
            {i18n.t("GLOBAL.NAVIGATION.CONTACT_US")}
          </AtomButton>
        }
      />
    </section>
  );
}
