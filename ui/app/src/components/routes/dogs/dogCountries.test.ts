import { countriesOf } from "@/components/routes/dogs/dogCountries";
import type { PublicDog } from "@/services/fetch-dogs/fetchDogs.types";

const dog = (
  identification: string,
  country: { id: string; name: string } | null,
): PublicDog => ({
  identification,
  name: `dog-${identification}`,
  handler: "",
  country: country as PublicDog["country"],
  sex: null,
  breed: { id: "", name: "" },
  rank: "1",
});

describe("countriesOf", () => {
  test("lists every country of the loaded dogs once, sorted by name", () => {
    expect(
      countriesOf([
        dog("1", { id: "PT", name: "Portugal" }),
        dog("2", { id: "ES", name: "Spain" }),
        dog("3", { id: "PT", name: "Portugal" }),
        dog("4", { id: "DE", name: "Germany" }),
      ]),
    ).toEqual([
      { id: "DE", name: "Germany" },
      { id: "PT", name: "Portugal" },
      { id: "ES", name: "Spain" },
    ]);
  });

  test("has nothing to offer before any dog is loaded", () => {
    expect(countriesOf([])).toEqual([]);
  });

  /** A country the bundle has no name for still has to be filterable, so its code stands in. */
  test("falls back to the country code when the name is missing", () => {
    expect(countriesOf([dog("1", { id: "ES", name: "" })])).toEqual([
      { id: "ES", name: "ES" },
    ]);
  });

  test("skips a dog with no country rather than offering an empty option", () => {
    expect(
      countriesOf([dog("1", null), dog("2", { id: "ES", name: "Spain" })]),
    ).toEqual([{ id: "ES", name: "Spain" }]);
  });
});
