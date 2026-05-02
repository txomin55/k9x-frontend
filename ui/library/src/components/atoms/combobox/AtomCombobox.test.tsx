import { render, screen } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { AtomCombobox, type AtomComboboxOption } from "./AtomCombobox";

const OPTIONS: AtomComboboxOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Blueberry", value: "blueberry" },
];

describe("AtomCombobox", () => {
  test("renders placeholder and available options", async () => {
    const user = userEvent.setup();

    const { getByRole } = render(() => (
      <AtomCombobox
        label="Favorite fruit"
        options={OPTIONS}
        placeholder="Select a fruit"
        description="Pick one fruit from the list"
      />
    ));

    expect(getByRole("combobox")).toHaveAttribute(
      "placeholder",
      "Select a fruit",
    );
    expect(getByRole("group")).toHaveTextContent("Favorite fruit");
    expect(getByRole("group")).toHaveTextContent(
      "Pick one fruit from the list",
    );

    await user.click(getByRole("button"));

    const options = await screen.findAllByRole("option");

    expect(options).toHaveLength(3);
    expect(options[0]).toHaveTextContent("Apple");
    expect(options[1]).toHaveTextContent("Banana");
    expect(options[2]).toHaveTextContent("Blueberry");
  });

  test("renders the default value", () => {
    const { getByRole } = render(() => (
      <AtomCombobox
        defaultValue={OPTIONS[1]}
        label="Favorite fruit"
        options={OPTIONS}
      />
    ));

    expect(getByRole("combobox")).toHaveValue("Banana");
  });

  test("calls onChange when an option is selected", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    const { getByRole } = render(() => (
      <AtomCombobox
        options={OPTIONS}
        onChange={onChange}
        placeholder="Select a fruit"
      />
    ));

    await user.click(getByRole("button"));

    const option = await screen.findByRole("option", { name: "Banana" });
    await user.click(option);

    expect(onChange).toHaveBeenCalledWith(OPTIONS[1]);
  });

  test("renders a controlled value and error message", () => {
    const { getByRole, getByText } = render(() => (
      <AtomCombobox
        errorMessage="This field is required"
        label="Favorite fruit"
        options={OPTIONS}
        validationState="invalid"
        value={OPTIONS[2]}
      />
    ));

    expect(getByRole("combobox")).toHaveValue("Blueberry");
    expect(getByText("This field is required")).toBeInTheDocument();
  });

  test("renders custom slot content when children are provided", () => {
    const { getByText } = render(() => (
      <AtomCombobox options={OPTIONS}>
        <div>Contenido extra</div>
      </AtomCombobox>
    ));

    expect(getByText("Contenido extra")).toBeInTheDocument();
  });
});
