import { render } from "@solidjs/testing-library";
import AtomSelect from "@lib/components/atoms/select/AtomSelect";

const OPTIONS = [
  { label: "Dog", value: "dog" },
  { label: "Cat", value: "cat" },
  { label: "Fox", value: "fox", disabled: true },
];

describe("AtomSelect", () => {
  test("renders placeholder and label", () => {
    const { getByText, getByRole } = render(() => (
      <AtomSelect
        label="Favorite animal"
        options={OPTIONS}
        placeholder="Select an animal"
      />
    ));

    expect(getByText("Favorite animal")).toBeInTheDocument();
    expect(getByRole("button")).toHaveTextContent("Select an animal");
  });

  test("renders the selected default value", () => {
    const { getByRole } = render(() => (
      <AtomSelect defaultValue={OPTIONS[1]} options={OPTIONS} />
    ));

    expect(getByRole("button")).toHaveTextContent("Cat");
  });

  test("reflects the controlled open state in the trigger", () => {
    const { getByRole } = render(() => <AtomSelect open options={OPTIONS} />);

    expect(getByRole("button")).toHaveAttribute("aria-expanded", "true");
  });
});
