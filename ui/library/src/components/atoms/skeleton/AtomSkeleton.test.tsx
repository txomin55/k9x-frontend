import { render } from "@solidjs/testing-library";
import AtomSkeleton from "@lib/components/atoms/skeleton/AtomSkeleton";

describe("AtomSkeleton", () => {
  test("renders a single placeholder by default", () => {
    const { container } = render(() => <AtomSkeleton />);

    const items = container.querySelectorAll(".atom-skeleton");

    expect(items).toHaveLength(1);
    expect(items[0]).toHaveAttribute("data-variant", "text");
    expect(items[0]).toHaveAttribute("aria-hidden", "true");
  });

  test("renders one placeholder per count", () => {
    const { container } = render(() => <AtomSkeleton count={4} />);

    expect(container.querySelectorAll(".atom-skeleton")).toHaveLength(4);
  });

  test("forwards variant and inline sizing", () => {
    const { container } = render(() => (
      <AtomSkeleton variant="circular" width="40px" height="40px" />
    ));

    const item = container.querySelector(".atom-skeleton") as HTMLElement;

    expect(item).toHaveAttribute("data-variant", "circular");
    expect(item.style.width).toBe("40px");
    expect(item.style.height).toBe("40px");
  });

  test("can disable the shimmer animation", () => {
    const { container } = render(() => <AtomSkeleton animated={false} />);

    expect(
      container.querySelector(".atom-skeleton--animated"),
    ).not.toBeInTheDocument();
  });
});
