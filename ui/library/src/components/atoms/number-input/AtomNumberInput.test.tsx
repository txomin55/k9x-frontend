import { render } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import AtomNumberInput from "@lib/components/atoms/number-input/AtomNumberInput";

describe("AtomNumberInput", () => {
  test("renders label and placeholder", () => {
    const { getByText, getByPlaceholderText } = render(() => (
      <AtomNumberInput label="Quantity" placeholder="0" />
    ));

    expect(getByText("Quantity")).toBeInTheDocument();
    expect(getByPlaceholderText("0")).toBeInTheDocument();
  });

  test("renders the default numeric value", () => {
    const { getByRole } = render(() => (
      <AtomNumberInput defaultValue={4} />
    ));

    expect(getByRole("spinbutton")).toHaveValue("4");
  });

  test("calls onRawValueChange when incrementing", async () => {
    const user = userEvent.setup();
    const onRawValueChange = vi.fn();
    const { getByRole } = render(() => (
      <AtomNumberInput
        defaultValue={1}
        onRawValueChange={onRawValueChange}
        step={1}
      />
    ));

    const incrementButton = getByRole("button", { name: "+" });

    await user.click(incrementButton);

    expect(onRawValueChange).toHaveBeenCalledWith(2);
  });

  test("renders error message when invalid", () => {
    const { getByText } = render(() => (
      <AtomNumberInput
        errorMessage="Quantity must be positive"
        validationState="invalid"
      />
    ));

    expect(getByText("Quantity must be positive")).toBeInTheDocument();
  });
});
