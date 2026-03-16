import { render } from "@solidjs/testing-library";
import HomeRoute from "@/routes/home/index";

describe("home route", () => {
  test("renders login text", () => {
    const { queryByText } = render(() => <HomeRoute />);

    expect(queryByText("ESTAS LOGUEADO")).not.toBeInTheDocument();
  });
});
