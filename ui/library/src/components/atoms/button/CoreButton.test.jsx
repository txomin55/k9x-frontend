import { render } from "@testing-library/react";
import CoreButton from "./CoreButton";

describe("test library", () => {
  test("prueba library", () => {
    render(<CoreButton />);
    expect(1).toBe(1);
  });
});
