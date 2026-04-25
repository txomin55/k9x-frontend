import { render, screen, within } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
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

  test("renders error message when invalid", () => {
    const { getByText } = render(() => (
      <AtomSelect
        errorMessage="Select one option"
        options={OPTIONS}
        validationState="invalid"
      />
    ));

    expect(getByText("Select one option")).toBeInTheDocument();
  });

  test("renders preLabel content for an option", async () => {
    const user = userEvent.setup();
    const optionsWithPreLabel = [
      {
        label: "Portugal",
        value: "pt",
        preLabel: <span>PT</span>,
      },
      {
        label: "Spain",
        value: "es",
      },
    ];

    render(() => (
      <AtomSelect
        label="Country"
        options={optionsWithPreLabel}
        placeholder="Select a country"
      />
    ));

    await user.click(
      screen.getByRole("button", { name: "Country Select a country" }),
    );

    const portugalOption = await screen.findByRole("option", {
      name: "Portugal",
    });

    expect(within(portugalOption).getByText("PT")).toBeInTheDocument();
    expect(within(portugalOption).getByText("Portugal")).toBeInTheDocument();
  });
});
