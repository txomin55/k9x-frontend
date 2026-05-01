import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { AtomCombobox } from "./AtomCombobox";

const OPTIONS = ["Apple", "Banana", "Blueberry"];

describe("AtomCombobox", () => {
  test("renders placeholder and available options", async () => {
    const user = userEvent.setup();

    const { getByRole } = render(() => (
      <AtomCombobox
        ariaLabel="Favorite fruit"
        options={OPTIONS}
        placeholder="Select a fruit"
      />
    ));

    expect(getByRole("combobox")).toHaveAttribute(
      "placeholder",
      "Select a fruit",
    );

    await user.click(getByRole("button"));

    const options = await screen.findAllByRole("option");

    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent("Apple");
    expect(options[1]).toHaveTextContent("Banana");
    expect(options[2]).toHaveTextContent("Blueberry");
  });

  test("calls onChange when an option is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const { getByRole } = render(() => (
      <AtomCombobox
        ariaLabel="Favorite fruit"
        options={OPTIONS}
        onChange={onChange}
        placeholder="Select a fruit"
      />
    ));

    await user.click(getByRole("button"));

    const option = await screen.findByRole("option", { name: "Banana" });
    await user.click(option);

    expect(onChange).toHaveBeenCalledWith("Banana");
  });

  test("renders a controlled value", () => {
    const { getByRole } = render(() => (
      <AtomCombobox
        ariaLabel="Favorite fruit"
        options={OPTIONS}
        value="Blueberry"
      />
    ));

    expect(getByRole("combobox")).toHaveValue("Blueberry");
  });
});
