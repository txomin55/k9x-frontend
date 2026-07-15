import { renderSolid } from "@lib/../.storybook/renderSolid";
import AtomSelect, { type AtomSelectProps } from "@lib/components/atoms/select/AtomSelect";

const OPTIONS = [
  { label: "Dog", value: "dog" },
  { label: "Cat", value: "cat" },
  { label: "Fox", value: "fox" },
  { label: "Whale", value: "whale", disabled: true },
];

const OPTIONS_WITH_PRELABEL = [
  {
    label: "Portugal",
    value: "pt",
    preLabel: <span>PT</span>,
  },
  {
    label: "Spain",
    value: "es",
    preLabel: <span>ES</span>,
  },
  {
    label: "France",
    value: "fr",
    preLabel: <span>FR</span>,
  },
];

const meta = {
  title: "Atoms/AtomSelect",
  render: (args: AtomSelectProps) => renderSolid(() => <AtomSelect {...args} />),
};

export default meta;

export const Basic = {
  args: {
    label: "Favorite animal",
    description: "Choose one option from the list.",
    placeholder: "Select an animal",
    options: OPTIONS,
  },
};

export const WithDefaultValue = {
  args: {
    label: "Favorite animal",
    options: OPTIONS,
    defaultValue: OPTIONS[1],
  },
};

export const WithPreLabel = {
  args: {
    label: "Country",
    description: "Each option includes a visible preLabel prefix.",
    placeholder: "Select a country",
    options: OPTIONS_WITH_PRELABEL,
  },
};
