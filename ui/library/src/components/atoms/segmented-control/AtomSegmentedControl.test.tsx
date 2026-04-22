import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, vi } from "vitest";
import { AtomSegmentedControl } from "@lib/components/atoms/segmented-control/AtomSegmentedControl";

const CONTROLS = [
  { value: "grid", text: "Grid" },
  { value: "list", text: "List" },
  { value: "board", text: "Board" },
];

const originalResizeObserver = globalThis.ResizeObserver;

beforeAll(() => {
  class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  vi.stubGlobal("ResizeObserver", ResizeObserverMock);
});

afterAll(() => {
  if (originalResizeObserver) {
    vi.stubGlobal("ResizeObserver", originalResizeObserver);
    return;
  }

  vi.unstubAllGlobals();
});

describe("AtomSegmentedControl", () => {
  test("renders the title and marks the default control as selected", () => {
    render(() => (
      <AtomSegmentedControl
        title="View"
        defaultValue="grid"
        controls={CONTROLS}
      />
    ));

    expect(screen.getByText("View")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Grid" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "List" })).not.toBeChecked();
  });

  test("updates the selected control and calls onControlChange when a new option is clicked", async () => {
    const user = userEvent.setup();
    const onControlChange = vi.fn();

    render(() => (
      <AtomSegmentedControl
        title="View"
        defaultValue="grid"
        controls={CONTROLS}
        onControlChange={onControlChange}
      />
    ));

    await user.click(screen.getByRole("radio", { name: "List" }));

    expect(screen.getByRole("radio", { name: "List" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Grid" })).not.toBeChecked();
    expect(onControlChange).toHaveBeenCalledWith("list");
    expect(onControlChange).toHaveBeenCalledTimes(1);
  });

  test("allows changing the selection when onControlChange is omitted", async () => {
    const user = userEvent.setup();

    render(() => (
      <AtomSegmentedControl
        title="View"
        defaultValue="grid"
        controls={CONTROLS}
      />
    ));

    await user.click(screen.getByRole("radio", { name: "Board" }));

    expect(screen.getByRole("radio", { name: "Board" })).toBeChecked();
  });
});
