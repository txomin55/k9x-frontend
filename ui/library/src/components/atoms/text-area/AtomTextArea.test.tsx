import { render } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import AtomTextArea from "@lib/components/atoms/text-area/AtomTextArea";

describe("AtomTextArea", () => {
  test("renders label and placeholder", () => {
    const { getByText, getByPlaceholderText } = render(() => (
      <AtomTextArea label="Notes" placeholder="Write your message..." />
    ));

    expect(getByText("Notes")).toBeInTheDocument();
    expect(getByPlaceholderText("Write your message...")).toBeInTheDocument();
  });

  test("calls onChange when typing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { getByRole } = render(() => <AtomTextArea onChange={onChange} />);

    const textArea = getByRole("textbox");

    await user.type(textArea, "hola");

    expect(onChange).toHaveBeenLastCalledWith("hola");
  });

  test("renders controlled value", () => {
    const { getByDisplayValue } = render(() => <AtomTextArea value="fixed" />);

    expect(getByDisplayValue("fixed")).toBeInTheDocument();
  });

  test("renders error message when invalid", () => {
    const { getByText } = render(() => (
      <AtomTextArea errorMessage="Required field" validationState="invalid" />
    ));

    expect(getByText("Required field")).toBeInTheDocument();
  });
});
