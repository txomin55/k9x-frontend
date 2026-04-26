import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { afterAll, beforeAll, vi } from "vitest";
import { AtomSegmentedControl } from "@lib/components/atoms/segmented-control/AtomSegmentedControl";

const CONTROLS = [
  {
    value: "grid",
    text: "Grid",
    content: <div>Grid content</div>,
  },
  {
    value: "list",
    text: "List",
    content: <div>List content</div>,
  },
  {
    value: "board",
    text: "Board",
    content: <div>Board content</div>,
  },
];

const CONTROLS_WITH_DISABLED = [
  {
    value: "grid",
    text: "Grid",
    content: <div>Grid content</div>,
  },
  {
    value: "list",
    text: "List",
    content: <div>List content</div>,
    disabled: true,
  },
  {
    value: "board",
    text: "Board",
    content: <div>Board content</div>,
  },
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
  test("renders the title, marks the default control as selected, and shows its content", () => {
    render(() => (
      <AtomSegmentedControl title="View" control="grid" controls={CONTROLS} />
    ));

    expect(screen.getByText("View")).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Grid" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "List" })).not.toBeChecked();
    expect(screen.getByText("Grid content")).toBeInTheDocument();
    expect(screen.queryByText("List content")).not.toBeInTheDocument();
  });

  test("updates the selected control and swaps the rendered content when a new option is clicked", async () => {
    const user = userEvent.setup();

    render(() => (
      <AtomSegmentedControl title="View" control="grid" controls={CONTROLS} />
    ));

    await user.click(screen.getByRole("radio", { name: "List" }));

    expect(screen.getByRole("radio", { name: "List" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Grid" })).not.toBeChecked();
    expect(screen.getByText("List content")).toBeInTheDocument();
    expect(screen.queryByText("Grid content")).not.toBeInTheDocument();
  });

  test("allows changing the selection when onControlChange is omitted", async () => {
    const user = userEvent.setup();

    render(() => (
      <AtomSegmentedControl title="View" control="grid" controls={CONTROLS} />
    ));

    await user.click(screen.getByRole("radio", { name: "Board" }));

    expect(screen.getByRole("radio", { name: "Board" })).toBeChecked();
    expect(screen.getByText("Board content")).toBeInTheDocument();
  });

  test("renders disabled controls as unavailable", () => {
    render(() => (
      <AtomSegmentedControl
        title="View"
        control="grid"
        controls={CONTROLS_WITH_DISABLED}
      />
    ));

    expect(screen.getByRole("radio", { name: "Grid" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "List" })).toBeDisabled();
    expect(screen.getByText("Grid content")).toBeInTheDocument();
  });

  test("does not change the selection when a disabled control is clicked", async () => {
    const user = userEvent.setup();
    const onControlChange = vi.fn();

    render(() => (
      <AtomSegmentedControl
        title="View"
        control="grid"
        controls={CONTROLS_WITH_DISABLED}
        onControlChange={onControlChange}
      />
    ));

    await user.click(screen.getByRole("radio", { name: "List" }));

    expect(screen.getByRole("radio", { name: "Grid" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "List" })).not.toBeChecked();
    expect(screen.getByText("Grid content")).toBeInTheDocument();
    expect(screen.queryByText("List content")).not.toBeInTheDocument();
    expect(onControlChange).not.toHaveBeenCalled();
  });
});
