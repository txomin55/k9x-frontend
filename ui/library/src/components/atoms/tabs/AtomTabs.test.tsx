import { render } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import AtomTabs from "@lib/components/atoms/tabs/AtomTabs";
import type {
  TabsContentProps,
  TabsOptionProps,
} from "@lib/components/atoms/tabs/AtomTabs";

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
    const { getByRole, getByText, queryByText } = render(() => (
      <AtomTabs
        defaultValue="dogs"
        options={TAB_OPTIONS}
        contents={TAB_CONTENTS}
      />
    ));

    expect(getByRole("tab", { name: "Dogs" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(getByText("Dogs are loyal companions.")).toBeVisible();
    expect(queryByText("Cats are curious by nature.")).not.toBeInTheDocument();
  });

  test("switches content when a different tab is activated", async () => {
    const user = userEvent.setup();
    const { getByRole, findByText } = render(() => (
      <AtomTabs
        defaultValue="dogs"
        options={TAB_OPTIONS}
        contents={TAB_CONTENTS}
      />
    ));

    const catsTab = getByRole("tab", { name: "Cats" });
    await user.click(catsTab);

    expect(catsTab).toHaveAttribute("aria-selected", "true");
    expect(await findByText("Cats are curious by nature.")).toBeVisible();
    expect(getByRole("tab", { name: "Dogs" })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });
});
