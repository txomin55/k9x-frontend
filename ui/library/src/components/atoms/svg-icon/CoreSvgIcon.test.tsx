import { render } from "@solidjs/testing-library";
import CoreSvgIcon from "@lib/components/atoms/svg-icon/CoreSvgIcon";

describe("CoreSvgIcon", () => {
  test("renders an image with the provided src and alt", () => {
    const { getByAltText } = render(() => (
      <CoreSvgIcon src="/icons/dog.svg" alt="dog icon" />
    ));

    const image = getByAltText("dog icon");

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/icons/dog.svg");
    expect(image).toHaveAttribute("alt", "dog icon");
  });

  test("defaults alt to an empty string when not provided", () => {
    const { container } = render(() => <CoreSvgIcon src="/icons/cat.svg" />);

    const image = container.querySelector("img");

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/icons/cat.svg");
    expect(image).toHaveAttribute("alt", "");
  });
});
