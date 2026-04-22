import type { JSX } from "solid-js";

export interface TabsOptionProps {
  value: string;
  content: JSX.Element;
}

export interface TabsContentProps {
  value: string;
  content: JSX.Element;
}

export interface TabsProps {
  defaultValue: string;
  options: TabsOptionProps[];
  contents: TabsContentProps[];
}
