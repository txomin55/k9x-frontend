import { render } from "@solidjs/testing-library";
import HomeRoute from "@/routes/home/index";

vi.mock("@/guards/auth/AuthGuard", () => ({
  default: (props) => props.children,
}));

describe("home route", () => {
  test("renders login text", () => {
    const { getByText } = render(() => <HomeRoute />);

    expect(getByText("ESTAS LOGUEADO")).toBeInTheDocument();
  });
});
