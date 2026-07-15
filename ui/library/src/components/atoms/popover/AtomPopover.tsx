import { Popover } from "@kobalte/core/popover";
import { createSignal } from "solid-js";
import type { JSX } from "solid-js";
import "./styles.css";

export type AtomPopoverProps = {
  trigger: JSX.Element;
  content: JSX.Element;
};

export default function AtomPopover(props: AtomPopoverProps) {
  const [open, setOpen] = createSignal(false);

  return (
    <Popover
      gutter={8}
      open={open()}
      onOpenChange={setOpen}
      placement="bottom-start"
    >
      <div class="atom-popover">
        <Popover.Trigger class="atom-popover__trigger">
          {props.trigger}
        </Popover.Trigger>
      </div>
      <Popover.Content class="atom-popover__content">
        {props.content}
      </Popover.Content>
    </Popover>
  );
}
