import CountryFilter, {
  ANY_COUNTRY,
} from "@/components/common/country-filter/CountryFilter";
import { render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/secured/country-crud/countryCrud", () => ({
  useCountries: () => ({ data: [{ id: "ES", name: "Spain" }] }),
}));
vi.mock("@/stores/i18n/i18n", () => ({
  useI18n: () => ({
    t: (key: string) =>
      key === "COMMON.COUNTRY_FIELD.ALL" ? "All countries" : "Country",
  }),
}));

describe("CountryFilter", () => {
  it("shows the all-countries entry instead of the select placeholder", () => {
    const { getByRole } = render(() => (
      <CountryFilter value={ANY_COUNTRY} onChange={() => {}} />
    ));

    expect(getByRole("button").textContent).toContain("All countries");
  });

  it("shows the picked country", () => {
    const { getByRole } = render(() => (
      <CountryFilter value="ES" onChange={() => {}} />
    ));

    expect(getByRole("button").textContent).toContain("Spain");
  });
});
