import { render } from "@testing-library/react";
import HomePage from "./HomePage";

describe("test", () => {
  test("prueba", () => {
    render(<HomePage />);
    expect(1).toBe(1);
  });
});
