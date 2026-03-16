import { render } from "@solidjs/testing-library";
import HomeRoute from "@/routes/home/index";

describe("home route", () => {
  test("renders login text", () => {
    const { getByText } = render(() => <HomeRoute />);

    expect(getByText("ESTAS LOGUEADO")).not.toBeInTheDocument();
  });
});
