import { JSX } from "solid-js";

interface Crumbs {
  route: string;
  text: string;
}
export interface AtomBreadcrumbsProps {
  crumbs: Crumbs[];
}

export interface AtomBreadCrumbLinkProps {
  route: string;
  showSeparator: boolean;
  children: JSX.Element;
}
