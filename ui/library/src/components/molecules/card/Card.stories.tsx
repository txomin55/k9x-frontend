import { renderSolid } from "@lib/../.storybook/renderSolid";
import Card from "@lib/components/molecules/card/Card";

const meta = {
  title: "Molecules/Card",
  render: () => renderSolid(() => <Card />),
};

export default meta;

export const Basic = {};
