import { renderSolid } from "@lib/../.storybook/renderSolid";
import AtomButton, {
  BUTTON_TYPES,
} from "@lib/components/atoms/button/AtomButton";
import Card from "@lib/components/molecules/card/Card";
import { fn } from "storybook/test";

type CardStoryArgs = {
  topLeftLabel: string;
  topRightLabel: string;
  subHeader: string;
  description: string;
  gradeSummary: string;
  secondaryAction: string;
  primaryAction: string;
};

const onSecondaryAction = fn();
const onPrimaryAction = fn();

const meta = {
  title: "Molecules/Card",
  argTypes: {
    topLeftLabel: { control: "text" },
    topRightLabel: { control: "text" },
    subHeader: { control: "text" },
    description: { control: "text" },
    gradeSummary: { control: "text" },
    secondaryAction: { control: "text" },
    primaryAction: { control: "text" },
  },
  render: (args: CardStoryArgs) =>
    renderSolid(() => (
      <Card
        topLeft={<strong>{args.topLeftLabel}</strong>}
        topRight={<span>{args.topRightLabel}</span>}
        subHeader={args.subHeader}
        description={args.description}
        content={<span>{args.gradeSummary}</span>}
        actions={
          <>
            <AtomButton type={BUTTON_TYPES.GHOST} onClick={onSecondaryAction}>
              {args.secondaryAction}
            </AtomButton>
            <AtomButton type={BUTTON_TYPES.PRIMARY} onClick={onPrimaryAction}>
              {args.primaryAction}
            </AtomButton>
          </>
        }
      />
    )),
};

export default meta;

export const Basic = {
  args: {
    topLeftLabel: "Math",
    topRightLabel: "A",
    subHeader: "Updated 2 hours ago",
    description: "Final semester performance across exams and homework.",
    gradeSummary: "Exam 92, Homework 88, Participation 95",
    secondaryAction: "Details",
    primaryAction: "Open",
  },
};
