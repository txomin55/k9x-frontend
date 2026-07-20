import { render } from "@solidjs/testing-library";
import AtomCheckbox from "@lib/components/atoms/checkbox/AtomCheckbox";
import userEvent from "@testing-library/user-event/dist/cjs/index.js";

describe("AtomCheckbox", () => {
  const user = userEvent.setup();

  test("renders the label", () => {
    const { getByText } = render(() => (
      <AtomCheckbox checked={false} setChecked={() => {}} label="Test Label" />
    ));
    expect(getByText("Test Label")).toBeInTheDocument();
  });

  test("reflects checked state", () => {
    const { getByRole } = render(() => (
      <AtomCheckbox checked={true} setChecked={() => {}} label="Test Label" />
    ));
    const checkbox = getByRole("checkbox") as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  test("calls setChecked when clicked", async () => {
    const setChecked = vi.fn();
    const { getByLabelText } = render(() => (
      <AtomCheckbox
        checked={false}
        setChecked={setChecked}
        label="Test Label"
      />
    ));

    const label = getByLabelText("Test Label");
    await user.click(label);

    expect(setChecked).toHaveBeenCalledWith(true);
  });

  test("reflects disabled state", () => {
    const { getByLabelText, getByRole } = render(() => (
      <AtomCheckbox checked={false} disabled label="Test Label" />
    ));

    const label = getByLabelText("Test Label");
    user.click(label);

    expect(getByRole("checkbox")).toBeDisabled();
  });
});
