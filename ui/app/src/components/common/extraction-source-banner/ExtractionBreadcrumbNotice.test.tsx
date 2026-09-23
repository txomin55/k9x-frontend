import { fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal, Show } from "solid-js";
import ExtractionBreadcrumbNotice from "@/components/common/extraction-source-banner/ExtractionBreadcrumbNotice";
import ExtractionSourceBanner from "@/components/common/extraction-source-banner/ExtractionSourceBanner";

vi.mock("@/stores/i18n/i18n", () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock("@/stores/auth/auth", () => ({
  useAuthUser: () => () => ({ id: "user-1" }),
}));

const extraction = {
  extractionId: "extraction-1",
  hint: "Imported from the club results page",
  source: { url: "https://example.com", extractionTimestamp: 1_757_721_600_000 },
};

describe("ExtractionBreadcrumbNotice", () => {
  test("a page banner shows up as a warning icon that opens the details", async () => {
    const { getByRole, queryByText } = render(() => (
      <>
        <ExtractionBreadcrumbNotice />
        <ExtractionSourceBanner extraction={extraction as never} context="Event" />
      </>
    ));

    expect(queryByText("COMMON.EXTRACTION_BANNER.MESSAGE")).not.toBeInTheDocument();

    fireEvent.click(
      getByRole("img", {
        name: "COMMON.EXTRACTION_BANNER.MESSAGE_SHORT",
      }).closest("button") as HTMLElement,
    );

    expect(await screen.findByText("COMMON.EXTRACTION_BANNER.MESSAGE")).toBeInTheDocument();
    expect(await screen.findByText("Imported from the club results page")).toBeInTheDocument();
    expect(await screen.findByText("COMMON.EXTRACTION_BANNER.SOURCE_LINK")).toBeInTheDocument();
    expect(await screen.findByText("COMMON.EXTRACTION_BANNER.REPORT")).toBeInTheDocument();
  });

  test("the icon goes away when the page leaves", () => {
    const [mounted, setMounted] = createSignal(true);
    const { queryByRole } = render(() => (
      <>
        <ExtractionBreadcrumbNotice />
        <Show when={mounted()}>
          <ExtractionSourceBanner extraction={extraction as never} />
        </Show>
      </>
    ));

    expect(queryByRole("img", { name: "COMMON.EXTRACTION_BANNER.MESSAGE_SHORT" })).toBeInTheDocument();
    setMounted(false);
    expect(queryByRole("img", { name: "COMMON.EXTRACTION_BANNER.MESSAGE_SHORT" })).not.toBeInTheDocument();
  });

  test("an inline banner stays in place and leaves the breadcrumb alone", () => {
    const { queryByRole, getByText } = render(() => (
      <>
        <ExtractionBreadcrumbNotice />
        <ExtractionSourceBanner inline extraction={extraction as never} />
      </>
    ));

    expect(queryByRole("img", { name: "COMMON.EXTRACTION_BANNER.MESSAGE_SHORT" })).not.toBeInTheDocument();
    expect(getByText("COMMON.EXTRACTION_BANNER.MESSAGE_SHORT")).toBeInTheDocument();
  });
});
