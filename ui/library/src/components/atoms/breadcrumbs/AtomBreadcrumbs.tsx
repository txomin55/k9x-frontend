import { Breadcrumbs } from "@kobalte/core/breadcrumbs";
import { For, Show } from "solid-js";
import {
  AtomBreadCrumbLinkProps,
  AtomBreadcrumbsProps,
} from "@lib/components/atoms/breadcrumbs/AtomBreadcrumbs.types";
import "./styles.css";

const AtomBreadCrumbLink = (props: AtomBreadCrumbLinkProps) => (
  <li class="atom-breadcrumbs__item">
    <Breadcrumbs.Link href={props.route} class="breadcrumbs__link">
      {props.children}
    </Breadcrumbs.Link>
    <Show when={props.showSeparator}>
      <Breadcrumbs.Separator class="breadcrumbs__separator" />
    </Show>
  </li>
);

export default function (props: AtomBreadcrumbsProps) {
  const isNotLastElement = (idx) => props.crumbs.length !== idx() + 1;
  return (
    <Breadcrumbs class="atom-breadcrumb" separator=">">
      <ol>
        <For each={props.crumbs}>
          {(crumb, idx) => (
            <AtomBreadCrumbLink
              route={crumb.route}
              showSeparator={isNotLastElement(idx)}
            >
              {crumb.text}
            </AtomBreadCrumbLink>
          )}
        </For>
      </ol>
    </Breadcrumbs>
  );
}
