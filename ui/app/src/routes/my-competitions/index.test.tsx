import { render } from "@solidjs/testing-library";
import HomeRoute from "@/routes/my-competitions/index";

describe("my competition route", () => {
  test("renders login text", () => {
    const { queryByText } = render(() => <HomeRoute />);

    expect(queryByText("ESTAS LOGUEADO")).not.toBeInTheDocument();
  });
});
