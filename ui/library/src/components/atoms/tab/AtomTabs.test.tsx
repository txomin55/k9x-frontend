import { render } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import AtomTabs from "@lib/components/atoms/tab/AtomTabs";
import type { TabsOptionProps, TabsContentProps } from "@lib/components/atoms/tab/AtomTabs.types";

const TAB_OPTIONS: TabsOptionProps[] = [
  { value: "dogs", content: <span>Dogs</span> },
  { value: "cats", content: <span>Cats</span> },
];

const TAB_CONTENTS: TabsContentProps[] = [
  {
    value: "dogs",
    content: <div>Dogs are loyal companions.</div>,
  },
  {
    value: "cats",
    content: <div>Cats are curious by nature.</div>,
  },
];

describe("AtomTabs", () => {
  test("renders given options and shows the default content", () => {
    const { getByText, queryByText } = render(() => (
      <AtomTabs value="dogs" options={TAB_OPTIONS} contents={TAB_CONTENTS} />
    ));

    expect(getByText("Dogs")).toBeInTheDocument();
    expect(getByText("Dogs are loyal companions.")).toBeInTheDocument();
    expect(queryByText("Cats are curious by nature.")).not.toBeInTheDocument();
  });

  test("switches content when a different tab is activated", async () => {
    const user = userEvent.setup();
    const { getByText, findByText, queryByText } = render(() => (
      <AtomTabs value="dogs" options={TAB_OPTIONS} contents={TAB_CONTENTS} />
    ));

    const catsTab = getByText("Cats");
    await user.click(catsTab);

    expect(await findByText("Cats are curious by nature.")).toBeInTheDocument();
    expect(queryByText("Dogs are loyal companions.")).not.toBeInTheDocument();
  });
});
