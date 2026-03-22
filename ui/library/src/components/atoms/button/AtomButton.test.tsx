import { render } from "@solidjs/testing-library";
import AtomButton from "@lib/components/atoms/button/AtomButton";

describe("test library", () => {
  test("prueba library", () => {
    const { getByText } = render(() => <AtomButton>test</AtomButton>);
    expect(getByText("test")).toBeInTheDocument();
  });
});
