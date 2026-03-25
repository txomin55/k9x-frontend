import { render } from "@solidjs/testing-library";
import type { JSX } from "solid-js";
import { Route } from "@/routes/my-competitions/list/index";

describe("my competition route", () => {
  test("renders login text", () => {
    const Component = Route.options.component as () => JSX.Element;
    const { queryByText } = render(() => <Component />);

    expect(queryByText("ESTAS LOGUEADO")).not.toBeInTheDocument();
  });
});
