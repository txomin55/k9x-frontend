import { render } from "@solidjs/testing-library";
import BreadcrumbInfoSlides from "@/components/common/breadcrumb-info/BreadcrumbInfoSlides";

vi.mock("@/stores/i18n/i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

describe("BreadcrumbInfoSlides", () => {
  test("renders a single slide without a carousel", () => {
    const { container, getByText } = render(() => (
      <BreadcrumbInfoSlides slides={[[{ keys: ["STAGES.BREADCRUMB_INFO"] }]]} />
    ));

    expect(getByText("STAGES.BREADCRUMB_INFO")).toBeInTheDocument();
    expect(container.querySelector(".carousel")).not.toBeInTheDocument();
    expect(
      container.querySelector(".breadcrumb-info-slide__image"),
    ).not.toBeInTheDocument();
  });

  test("renders multiple slides inside a carousel", () => {
    const { container, getByText } = render(() => (
      <BreadcrumbInfoSlides
        slides={[
          [{ keys: ["KEY.ONE"], image: "one.webp" }],
          [{ keys: ["KEY.TWO"] }],
        ]}
      />
    ));

    expect(container.querySelector(".carousel")).toBeInTheDocument();
    expect(getByText("KEY.ONE")).toBeInTheDocument();
    expect(getByText("KEY.TWO")).toBeInTheDocument();
  });

  test("renders one paragraph per key inside a block", () => {
    const { container } = render(() => (
      <BreadcrumbInfoSlides slides={[[{ keys: ["KEY.ONE", "KEY.TWO"] }]]} />
    ));

    const paragraphs = container.querySelectorAll(
      ".breadcrumb-info-slide__text",
    );
    expect(paragraphs).toHaveLength(2);
    expect(container.querySelector(".carousel")).not.toBeInTheDocument();
  });

  test("renders every block of a slide with its image and text", () => {
    const { container } = render(() => (
      <BreadcrumbInfoSlides
        slides={[
          [
            { keys: ["KEY.ONE"], image: "one.webp" },
            { keys: ["KEY.TWO"], image: "two.webp" },
          ],
        ]}
      />
    ));

    const images = container.querySelectorAll(".breadcrumb-info-slide__image");
    expect(images).toHaveLength(2);
    expect(images[0]).toHaveAttribute("src", "one.webp");
    expect(images[0]).toHaveAttribute("alt", "KEY.ONE");
    expect(images[1]).toHaveAttribute("src", "two.webp");
    expect(images[1]).toHaveAttribute("alt", "KEY.TWO");
    expect(container.querySelector(".carousel")).not.toBeInTheDocument();
  });
});
