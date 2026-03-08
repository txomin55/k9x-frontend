import { render } from "@testing-library/svelte";
import HomePage from "./+page.svelte";

describe("home page", () => {
  test("renders login text", () => {
    const { getByText } = render(HomePage);
    expect(getByText("ESTAS LOGUEADO")).toBeInTheDocument();
  });
});
