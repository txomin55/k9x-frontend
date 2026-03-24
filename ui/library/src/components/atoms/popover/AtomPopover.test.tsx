import { render, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, vi } from "vitest";
import AtomPopover from "@lib/components/atoms/popover/AtomPopover";

let getComputedStyleSpy: ReturnType<typeof vi.spyOn>;
const originalGetComputedStyle = window.getComputedStyle.bind(window);

beforeAll(() => {
  getComputedStyleSpy = vi
    .spyOn(window, "getComputedStyle")
    .mockImplementation((element) => {
      const styles = originalGetComputedStyle(element);

      return new Proxy(styles, {
        get(target, prop, receiver) {
          if (prop === "animationName") {
            const value = Reflect.get(target, prop, receiver);
            return value === "" ? "none" : value;
          }

          return Reflect.get(target, prop, receiver);
        },
      });
    });
});

afterAll(() => {
  getComputedStyleSpy.mockRestore();
});

describe("AtomPopover", () => {
  test("renders the trigger and opens the content on click", async () => {
    const user = userEvent.setup();
    const { getByRole, findByText } = render(() => (
      <AtomPopover
        trigger={<span>Open popover</span>}
        content={<div>Popover content</div>}
      />
    ));

    const trigger = getByRole("button", { name: "Open popover" });

    expect(trigger).toBeInTheDocument();

    await user.click(trigger);

    expect(await findByText("Popover content")).toBeInTheDocument();
  });

  test("closes the content when the trigger is clicked again", async () => {
    const user = userEvent.setup();
    const { getByRole, findByText, queryByText } = render(() => (
      <AtomPopover
        trigger={<span>Open popover</span>}
        content={<div>Popover content</div>}
      />
    ));

    const trigger = getByRole("button", { name: "Open popover" });

    await user.click(trigger);
    expect(await findByText("Popover content")).toBeInTheDocument();

    await user.click(trigger);

    await waitFor(() => {
      expect(queryByText("Popover content")).not.toBeInTheDocument();
    });
  });
});
