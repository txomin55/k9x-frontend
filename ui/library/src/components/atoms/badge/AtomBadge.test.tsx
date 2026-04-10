import { render } from "@solidjs/testing-library";
import AtomBadge from "@lib/components/atoms/badge/AtomBadge";

describe("AtomBadge", () => {
  test("renders badge content", () => {
    const { getByText } = render(() => <AtomBadge>Active</AtomBadge>);

    expect(getByText("Active")).toBeInTheDocument();
  });

  test("forwards the configured variant and text value", () => {
    const { getByText } = render(() => (
      <AtomBadge kind="success" textValue="Account active">
        Active
      </AtomBadge>
    ));

    const badge = getByText("Active");

    expect(badge).toHaveAttribute("data-variant", "success");
    expect(badge).toHaveAttribute("aria-label", "Account active");
  });
});
