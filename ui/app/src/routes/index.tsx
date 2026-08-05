import {
  createFileRoute,
  Link,
  useLocation,
  useNavigate,
} from "@tanstack/solid-router";
import {
  createMemo,
  createSignal,
  For,
  onMount,
  Show,
  Suspense,
} from "solid-js";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import PageSeo from "@/components/common/page-seo/PageSeo";
import CountryFlag from "@/components/common/country-flag/CountryFlag";
import StatusBadge from "@/components/common/status-badge/StatusBadge";
import { useStages } from "@/services/fetch-stages/fetchStages";
import { useI18n } from "@/stores/i18n/i18n";
import ContactForm from "@/components/global/app-shell/layout/navigation/ContactForm";
import AtomButton, {
  BUTTON_SIZES,
} from "@lib/components/atoms/button/AtomButton";
import AtomCollapsible from "@lib/components/atoms/collapsible/AtomCollapsible";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";
import { AtomLogo } from "@lib/components/atoms/logo/AtomLogo";
import obdxIcon from "@/assets/disciplines/obdx.svg";
import k9xLogo from "@/assets/miscelaneous/k9x-logo.svg";
import { isStageLive } from "@/utils/stage";
import { isOffline } from "@/utils/local-first/localFirstPolicy";
import { defaultStagesDateRange, formatUtcDateOnly } from "@/utils/date";
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
              <AtomSkeleton variant="rectangular" />
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}

function LatestStages() {
  const i18n = useI18n();

  const defaultRange = defaultStagesDateRange();

  const fetchedStages = useStages(
    () => defaultRange.from,
    () => defaultRange.to,
    {
      refetchOnMount: !isOffline(),
      gcTime: 5 * 60 * 1000,
    },
  );

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
      <PageSeo
        title={i18n.t("HOME.META_TITLE")}
        description={i18n.t("HOME.META_DESCRIPTION")}
      />
      <AtomLogo
        line1Text={i18n.t("HOME.LOGO.LINE1")}
        line2Text={i18n.t("HOME.LOGO.LINE2")}
      />

      <div class="landing-page__hero">
        <span class="text-heading-lg">{i18n.t("HOME.HERO_TITLE")}</span>
        <p class="landing-page__lead">{i18n.t("HOME.HERO_LEAD")}</p>

        <div class="landing-page__actions">
          <AtomButton
            size={BUTTON_SIZES.MD}
            onClick={async () =>
              await navigate({
                to: AppRoutePath.STAGES as "/stages",
              })
            }
          >
            {i18n.t("HOME.BROWSE_STAGES")}
          </AtomButton>
        </div>
      </div>

      <div class="landing-page__what">
        <span class="landing-page__section-title">
          {i18n.t("HOME.WHAT_IS_TITLE")}
        </span>
        <p>{i18n.t("HOME.WHAT_IS_DESCRIPTION_1")}</p>
        <p>{i18n.t("HOME.WHAT_IS_DESCRIPTION_2")}</p>
        <p>{i18n.t("HOME.WHAT_IS_DESCRIPTION_3")}</p>
        <div class="landing-page__methodology">
          <Link
            class="landing-page__logo-link"
            to={AppRoutePath.METHODOLOGY_K9X as "/methodology/k9x"}
          >
            <img
              alt={i18n.t("HOME.METHODOLOGY_LINK_ALT")}
              class="landing-page__logo-link-image"
              src={k9xLogo}
            />
            <span class="landing-page__logo-link-name">
              {i18n.t("HOME.METHODOLOGY_LINK_NAME")}
            </span>
          </Link>
        </div>
        <div class="landing-page__disciplines">
          <span class="landing-page__disciplines-title">
            {i18n.t("HOME.SUPPORTED_DISCIPLINES_TITLE")}
          </span>
          <Link
            class="landing-page__logo-link"
            to={AppRoutePath.METHODOLOGY_OBDX as "/methodology/obdx"}
          >
            <img
              alt={i18n.t("HOME.DISCIPLINE_OBDX_ALT")}
              class="landing-page__logo-link-image"
              src={obdxIcon}
            />
            <span class="landing-page__logo-link-name">
              {i18n.t("HOME.DISCIPLINE_OBDX_NAME")}
            </span>
          </Link>
        </div>
      </div>

      <div class="landing-page__faq">
        <span class="landing-page__section-title">
          {i18n.t("HOME.FAQ_TITLE")}
        </span>
        <For
          each={[
            "FAQ_WHAT",
            "FAQ_ENROLL",
            "FAQ_ORGANIZER",
            "FAQ_OFFLINE",
            "FAQ_ACCOUNT",
          ]}
        >
          {(faq) => (
            <AtomCollapsible
              trigger={i18n.t(`HOME.${faq}_Q`)}
              content={<p>{i18n.t(`HOME.${faq}_A`)}</p>}
            />
          )}
        </For>
      </div>

      <Suspense
        fallback={<LatestStagesSkeleton title={i18n.t("HOME.LATEST_STAGES")} />}
      >
        <LatestStages />
      </Suspense>

      <div class="landing-page__grid">
        <For
          each={[
            "CARD_BROWSE",
            "CARD_LIVE",
            "CARD_ENROLL",
            "CARD_ORGANIZE",
            "CARD_DOGS",
            "CARD_ACCOUNT",
            "CARD_OFFLINE",
          ]}
        >
          {(card) => (
            <article class="landing-page__card">
              <span class="landing-page__card-kicker">
                {i18n.t(`HOME.${card}_KICKER`)}
              </span>
              <span class="landing-page__card-title">
                {i18n.t(`HOME.${card}_TITLE`)}
              </span>
              <p>{i18n.t(`HOME.${card}_DESCRIPTION`)}</p>
            </article>
          )}
        </For>
      </div>

      <AtomDialog
        closeButtonText={i18n.t("GLOBAL.NAVIGATION.CLOSE_DIALOG")}
        content={
          <ContactForm onClose={() => setOpenGenericContactForm(false)} />
        }
        onOpenChange={setOpenGenericContactForm}
        open={openGenericContactForm()}
        title={i18n.t("GLOBAL.NAVIGATION.CONTACT_US")}
        triggerClass="atom-dialog__trigger--ghost"
        trigger={<span>{i18n.t("GLOBAL.NAVIGATION.CONTACT_US")}</span>}
      />
    </section>
  );
}
