import { fireEvent, render } from "@solidjs/testing-library";
import { vi } from "vitest";
import AtomCollapsible from "@lib/components/atoms/collapsible/AtomCollapsible";

describe("AtomCollapsible", () => {
  test("renders the trigger and toggles content when uncontrolled", async () => {
    const { getByRole, queryByText, findByText } = render(() => (
      <AtomCollapsible
        trigger={<span>More details</span>}
        content={<div>Collapsible content</div>}
      />
    ));

    const trigger = getByRole("button", { name: "More details" });

    expect(trigger).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(queryByText("Collapsible content")).not.toBeInTheDocument();

    fireEvent.click(trigger);
    expect(await findByText("Collapsible content")).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    fireEvent.click(trigger);
    await Promise.resolve();

    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  test("calls onOpenChange in controlled mode", async () => {
    const onOpenChange = vi.fn();
    const { getByRole, findByText } = render(() => (
      <AtomCollapsible
        trigger={<span>More details</span>}
        content={<div>Collapsible content</div>}
        onOpenChange={onOpenChange}
        open
      />
    ));

    const trigger = getByRole("button", { name: "More details" });

    expect(await findByText("Collapsible content")).toBeInTheDocument();

    fireEvent.click(trigger);
    await Promise.resolve();

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
