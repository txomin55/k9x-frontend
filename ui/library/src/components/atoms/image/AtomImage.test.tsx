import { render } from "@solidjs/testing-library";
import CoreImage from "@lib/components/atoms/image/AtomImage";

class MockImage {
  onload: () => void = () => {};
  onerror: () => void = () => {};
  src = "";

  constructor() {
    setTimeout(() => {
      this.onload();
    }, 0);
  }
}

describe("CoreImage", () => {
  const originalGlobalImage = window.Image;

  beforeAll(() => {
    window.Image = MockImage as unknown as typeof window.Image;
  });

  afterAll(() => {
    window.Image = originalGlobalImage;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("renders the loaded image with forwarded props", async () => {
    const { findByAltText, queryByText } = render(() => (
      <CoreImage
        src="https://example.com/image.png"
        alt="example image"
        fallback="EI"
      />
    ));

    expect(queryByText("EI")).not.toBeInTheDocument();

    const image = await findByAltText("example image");

    expect(image).toHaveAttribute("src", "https://example.com/image.png");
    expect(image).toHaveAttribute("alt", "example image");
  });

  test("renders fallback after the configured delay when there is no src", async () => {
    vi.useFakeTimers();

    const { queryByText, findByText } = render(() => (
      <CoreImage alt="example image" fallback="EI" />
    ));

    expect(queryByText("EI")).not.toBeInTheDocument();

    vi.advanceTimersByTime(600);

    expect(await findByText("EI")).toBeInTheDocument();
  });
});
