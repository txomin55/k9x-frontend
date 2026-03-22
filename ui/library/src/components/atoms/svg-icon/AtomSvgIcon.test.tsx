import { render } from "@solidjs/testing-library";
import AtomSvgIcon from "@lib/components/atoms/svg-icon/AtomSvgIcon";

describe("AtomSvgIcon", () => {
  test("renders an image with the provided src and alt", () => {
    const { getByAltText } = render(() => (
      <AtomSvgIcon src="/icons/dog.svg" alt="dog icon" />
    ));

    const image = getByAltText("dog icon");

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/icons/dog.svg");
    expect(image).toHaveAttribute("alt", "dog icon");
  });

  test("defaults alt to an empty string when not provided", () => {
    const { container } = render(() => <AtomSvgIcon src="/icons/cat.svg" />);

    const image = container.querySelector("img");

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "/icons/cat.svg");
    expect(image).toHaveAttribute("alt", "");
  });
});
