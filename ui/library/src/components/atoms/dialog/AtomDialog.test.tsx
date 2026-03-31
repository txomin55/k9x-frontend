import { render, screen, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, vi } from "vitest";
import AtomDialog from "@lib/components/atoms/dialog/AtomDialog";

const originalScrollTo = window.scrollTo;
const originalGetComputedStyle = window.getComputedStyle.bind(window);
let getComputedStyleSpy: ReturnType<typeof vi.spyOn>;

beforeAll(() => {
  window.scrollTo = vi.fn();
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
  window.scrollTo = originalScrollTo;
  getComputedStyleSpy.mockRestore();
});

describe("AtomDialog", () => {
  test("renders the trigger and opens the content on click", async () => {
    const user = userEvent.setup();
    render(() => (
      <AtomDialog
        trigger={<span>Open dialog</span>}
        title="Dialog title"
        description="Dialog description"
        content={<div>Dialog content</div>}
      />
    ));

    const trigger = screen.getByRole("button", { name: "Open dialog" });

    expect(trigger).toBeInTheDocument();

    await user.click(trigger);

    expect(await screen.findByText("Dialog title")).toBeInTheDocument();
    expect(await screen.findByText("Dialog description")).toBeInTheDocument();
    expect(await screen.findByText("Dialog content")).toBeInTheDocument();
  });

  test("closes the content when the close button is clicked", async () => {
    const user = userEvent.setup();
    render(() => (
      <AtomDialog
        trigger={<span>Open dialog</span>}
        title="Dialog title"
        content={<div>Dialog content</div>}
      />
    ));

    await user.click(screen.getByRole("button", { name: "Open dialog" }));
    expect(await screen.findByText("Dialog content")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Close dialog" }));

    await waitFor(() => {
      expect(screen.queryByText("Dialog content")).not.toBeInTheDocument();
    });
  });
});
