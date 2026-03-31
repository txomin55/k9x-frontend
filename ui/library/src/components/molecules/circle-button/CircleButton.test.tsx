import { render } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";

describe("CircleButton", () => {
  test("renders its content", () => {
    const { getByRole } = render(() => <CircleButton>+</CircleButton>);

    expect(getByRole("button", { name: "+" })).toBeInTheDocument();
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
});
