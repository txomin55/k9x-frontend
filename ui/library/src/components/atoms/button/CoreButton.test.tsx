import { render } from "@solidjs/testing-library";
import CoreButton from "@lib/components/atoms/button/CoreButton";

describe("test library", () => {
  test("prueba library", () => {
    const { getByText } = render(() => <CoreButton label="test" />);
    expect(getByText("test")).toBeInTheDocument();
  });
});
