import { render } from "@solidjs/testing-library";
import ProfileImage from "@lib/components/molecules/profile-image/ProfileImage";

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

describe("ProfileImage", () => {
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
      <ProfileImage
        src="https://example.com/avatar.png"
        alt="user avatar"
        fallback="UA"
      />
    ));

    expect(queryByText("UA")).not.toBeInTheDocument();

    const image = await findByAltText("user avatar");

    expect(image).toHaveAttribute("src", "https://example.com/avatar.png");
    expect(image).toHaveAttribute("alt", "user avatar");
  });

  test("renders fallback after the configured delay when there is no src", async () => {
    vi.useFakeTimers();

    const { queryByText, findByText } = render(() => (
      <ProfileImage alt="user avatar" fallback="UA" />
    ));

    expect(queryByText("UA")).not.toBeInTheDocument();

    vi.advanceTimersByTime(600);

    expect(await findByText("UA")).toBeInTheDocument();
  });
});
