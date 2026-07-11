import { JSX } from "solid-js";

interface Crumbs {
  route: string;
  text: string;
  loading?: boolean;
}

export interface AtomBreadcrumbsInfo {
  trigger: JSX.Element;
  content: JSX.Element;
}

export interface AtomBreadcrumbsProps {
  crumbs: Crumbs[];
  onNavigate?: (route: string) => void;
  info?: AtomBreadcrumbsInfo | null;
}

export interface AtomBreadCrumbLinkProps {
  onNavigate?: (route: string) => void;
  route: string;
  showSeparator: boolean;
  children: JSX.Element;
}
