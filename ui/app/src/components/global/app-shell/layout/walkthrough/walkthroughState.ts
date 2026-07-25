import { createSignal } from "solid-js";

const WALKTHROUGH_DISABLED_KEY = "k9x_walkthrough_disabled";

export const isWalkthroughDisabled = () =>
  Boolean(globalThis.localStorage?.getItem(WALKTHROUGH_DISABLED_KEY));

const [isWalkthroughPending, setIsWalkthroughPending] = createSignal(true);

export { isWalkthroughPending, setIsWalkthroughPending };
