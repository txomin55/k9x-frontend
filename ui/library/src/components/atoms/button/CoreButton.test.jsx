import { render } from "@testing-library/svelte";
import CoreButton from "./CoreButton.svelte";

describe("test library", () => {
  test("prueba library", () => {
    const { getByText } = render(CoreButton, {
      props: { label: "test" },
    });
    expect(getByText("test")).toBeInTheDocument();
  });
});
