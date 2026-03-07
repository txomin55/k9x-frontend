import { render } from "@testing-library/svelte";
import CoreButton from "@lib/components/atoms/button/CoreButton.svelte";

describe("test library", () => {
  test("prueba library", () => {
    const { getByText } = render(CoreButton, {
      props: { label: "test" },
    });
    expect(getByText("test")).toBeInTheDocument();
  });
});
