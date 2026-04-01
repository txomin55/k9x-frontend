import { render } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";

describe("CircleButton", () => {
  test("renders its content", () => {
    const { getByRole } = render(() => <CircleButton>+</CircleButton>);

    expect(getByRole("button", { name: "+" })).toBeInTheDocument();
  });

  test("uses md size by default", () => {
    const { getByRole } = render(() => <CircleButton>+</CircleButton>);

    expect(getByRole("button", { name: "+" })).toHaveClass("circle-button--md");
  });

  test("calls onClick when pressed", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { getByRole } = render(() => (
      <CircleButton onClick={onClick}>+</CircleButton>
    ));

    await user.click(getByRole("button", { name: "+" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test("supports custom size and disabled state", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { getByRole } = render(() => (
      <CircleButton disabled onClick={onClick} size="lg">
        +
      </CircleButton>
    ));

    const button = getByRole("button", { name: "+" });

    expect(button).toHaveClass("circle-button--lg");
    expect(button).toBeDisabled();

    await user.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });
});
