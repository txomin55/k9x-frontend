import type { ParentProps } from "solid-js";
import "my-vitest/vitest-setup";
import { vi } from "vitest";

vi.mock("@solidjs/meta", () => ({
  MetaProvider: (props: ParentProps) => props.children,
  Title: () => null,
}));
