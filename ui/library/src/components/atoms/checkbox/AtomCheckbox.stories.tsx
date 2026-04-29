import { createSignal } from "solid-js";
import { renderSolid } from "@lib/../.storybook/renderSolid";
import AtomCheckbox from "@lib/components/atoms/checkbox/AtomCheckbox";
import type { AtomCheckboxProps } from "@lib/components/atoms/checkbox/AtomCheckbox.types";

const meta = {
  title: "Atoms/AtomCheckbox",
  argTypes: {
    checked: { control: "boolean" },
    label: { control: "text" },
    disabled: { control: "boolean" },
  },
  render: (args: AtomCheckboxProps) => {
    const [checked, setChecked] = createSignal(args.checked);
    return renderSolid(() => (
      <AtomCheckbox
        {...args}
        checked={checked()}
        disabled={args.disabled}
        setChecked={(v) => {
          setChecked(v);
          args.setChecked?.(v);
        }}
      />
    ));
  },
};

export default meta;

export const Default = {
  args: {
    checked: false,
    disabled: false,
    label: "Checkbox Label",
  },
};

export const Disabled = {
  args: {
    checked: false,
    disabled: true,
    label: "Disabled Label",
  },
};
