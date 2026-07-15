import { render } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import Carousel from "@lib/components/molecules/carousel/Carousel";

const items = [<span>One</span>, <span>Two</span>, <span>Three</span>];

describe("Carousel", () => {
  test("shows the first item and hides the prev button", () => {
    const { getByText, getAllByRole } = render(() => (
      <Carousel items={items} />
    ));

    expect(getByText("One")).toBeInTheDocument();
    expect(getAllByRole("button")).toHaveLength(1);
  });

  test("navigates forward and back through the items", async () => {
    const user = userEvent.setup();
    const { getByText, getByRole } = render(() => <Carousel items={items} />);

    await user.click(getByRole("button", { name: "›" }));
    expect(getByText("Two")).toBeInTheDocument();

    await user.click(getByRole("button", { name: "›" }));
    expect(getByText("Three")).toBeInTheDocument();

    await user.click(getByRole("button", { name: "‹" }));
    expect(getByText("Two")).toBeInTheDocument();
  });

  test("hides the next button on the last item", async () => {
    const user = userEvent.setup();
    const { getByRole, getAllByRole } = render(() => (
      <Carousel items={items} initialIndex={1} />
    ));

    await user.click(getByRole("button", { name: "›" }));

    expect(getAllByRole("button")).toHaveLength(1);
    expect(getByRole("button", { name: "‹" })).toBeInTheDocument();
  });

  test("reports the active index through onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { getByRole } = render(() => (
      <Carousel items={items} onChange={onChange} />
    ));

    await user.click(getByRole("button", { name: "›" }));

    expect(onChange).toHaveBeenCalledWith(1);
  });
});
