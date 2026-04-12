import { JSX } from "solid-js";

interface Crumbs {
  route: string;
  text: string;
}
export interface AtomBreadcrumbsProps {
  crumbs: Crumbs[];
  onNavigate?: (route: string) => void;
}

export interface AtomBreadCrumbLinkProps {
  onNavigate?: (route: string) => void;
  route: string;
  showSeparator: boolean;
  children: JSX.Element;
}
