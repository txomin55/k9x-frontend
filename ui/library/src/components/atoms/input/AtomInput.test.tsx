import { render } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import AtomInput from "@lib/components/atoms/input/AtomInput";

describe("AtomInput", () => {
  test("renders label and placeholder", () => {
    const { getByText, getByPlaceholderText } = render(() => (
      <AtomInput label="Email" placeholder="name@example.com" />
    ));

    expect(getByText("Email")).toBeInTheDocument();
    expect(getByPlaceholderText("name@example.com")).toBeInTheDocument();
  });

  test("calls onChange when typing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { getByRole } = render(() => <AtomInput onChange={onChange} />);

    const input = getByRole("textbox");

    await user.type(input, "abc");

    expect(onChange).toHaveBeenLastCalledWith("abc");
  });

  test("renders controlled value", () => {
    const { getByDisplayValue } = render(() => <AtomInput value="fixed" />);

    expect(getByDisplayValue("fixed")).toBeInTheDocument();
  });

  test("renders error message when invalid", () => {
    const { getByText } = render(() => (
      <AtomInput errorMessage="Required field" validationState="invalid" />
    ));

    expect(getByText("Required field")).toBeInTheDocument();
  });
});
