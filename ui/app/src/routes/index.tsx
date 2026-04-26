import {
  createFileRoute,
  Link,
  useLocation,
  useNavigate,
} from "@tanstack/solid-router";
import { onMount } from "solid-js";
import { AppRoutePath } from "@/components/global/app-shell/paths";
import "./styles.css";

const CALLBACK_PARAMS_KEY = "k9x_oauth_callback_params";

export const Route = createFileRoute("/")({
  component: EntryRoutePage,
});

function EntryRoutePage() {
  const navigate = useNavigate();
  const location = useLocation();

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
        <p class="landing-page__eyebrow">--K9X</p>
        <h1>--Stage management for real competition days</h1>
        <p class="landing-page__lead">
          --Track stages, inspect events, and move from planning to live action
          without losing the thread of the competition.
        </p>

        <div class="landing-page__actions">
          <Link
            class="landing-page__action landing-page__action--primary"
            to={AppRoutePath.STAGES as "/stages"}
          >
            --Browse stages
          </Link>
          <Link
            class="landing-page__action landing-page__action--secondary"
            to={AppRoutePath.MY_COMPETITIONS as never}
          >
            --Open my competitions
          </Link>
        </div>
      </div>

      <div class="landing-page__grid">
        <article class="landing-page__card">
          <span class="landing-page__card-kicker">--Discover</span>
          <h2>--Public stages with quick event access</h2>
          <p>
            --Jump into each stage, review dates and venue details, and open the
            event view with one path structure.
          </p>
        </article>

        <article class="landing-page__card">
          <span class="landing-page__card-kicker">--Operate</span>
          <h2>--Competition tooling for organizers</h2>
          <p>
            --Manage competitions, stages, judges, collections, and event data
            from the authenticated workspace.
          </p>
        </article>

        <article class="landing-page__card">
          <span class="landing-page__card-kicker">--Offline ready</span>
          <h2>--Keep working when connectivity drops</h2>
          <p>
            --The app is built around local-first flows so field work does not
            stop when the network does.
          </p>
        </article>
      </div>
    </section>
  );
}
