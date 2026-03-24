import { Popover } from "@kobalte/core/popover";
import { createSignal, type JSX } from "solid-js";
import "./AtomPopover.css";

export type AtomPopoverProps = {
  trigger: JSX.Element;
  content: JSX.Element;
};

export default function AtomPopover({ trigger, content }: AtomPopoverProps) {
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
          {trigger}
        </Popover.Trigger>
      </div>
      <Popover.Content class="atom-popover__content">{content}</Popover.Content>
    </Popover>
  );
}
