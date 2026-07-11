import { Breadcrumbs } from "@kobalte/core/breadcrumbs";
import { For, Show } from "solid-js";
import {
  AtomBreadCrumbLinkProps,
  AtomBreadcrumbsProps,
} from "@lib/components/atoms/breadcrumbs/AtomBreadcrumbs.types";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";
import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";
import "./styles.css";

const AtomBreadCrumbLink = (props: AtomBreadCrumbLinkProps) => (
  <li class="atom-breadcrumbs__item">
    <Breadcrumbs.Link
      href={props.route}
      class="breadcrumbs__link"
      onClick={(event) => {
        if (!props.onNavigate) {
          return;
        }

        event.preventDefault();
        props.onNavigate(props.route);
      }}
    >
      {props.children}
    </Breadcrumbs.Link>
    <Show when={props.showSeparator}>
      <Breadcrumbs.Separator class="breadcrumbs__separator" />
    </Show>
  </li>
);

export default function (props: AtomBreadcrumbsProps) {
  const isNotLastElement = (idx) => props.crumbs.length !== idx() + 1;
  const lastCrumbText = () => props.crumbs[props.crumbs.length - 1]?.text;

  return (
    <Breadcrumbs class="atom-breadcrumb" separator=">">
      <ol>
        <For each={props.crumbs}>
          {(crumb, idx) => (
            <AtomBreadCrumbLink
              onNavigate={crumb.loading ? undefined : props.onNavigate}
              route={crumb.route}
              showSeparator={isNotLastElement(idx)}
            >
              <Show when={!crumb.loading} fallback={<AtomSkeleton width="6rem" />}>
                {crumb.text}
              </Show>
            </AtomBreadCrumbLink>
          )}
        </For>
        <Show when={props.info}>
          <li class="atom-breadcrumbs__info">
            <AtomDialog
              trigger={props.info!.trigger}
              title={lastCrumbText()}
              content={props.info!.content}
            />
          </li>
        </Show>
      </ol>
    </Breadcrumbs>
  );
}
