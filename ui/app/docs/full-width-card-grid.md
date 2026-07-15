# Full-width responsive card grid

A card list that **always spans the full available width** — the lone card
stretches edge to edge when only one column fits, and every card stretches to
fill its share once more columns appear. Columns are added purely from how much
room the list has, with no media/container queries and no magic breakpoints.

This is what `/stages` uses. Reach for it whenever a `.card-list` leaves empty
space to the right of its cards.

## The snippet

```css
.my-section .card-list {
    grid-template-columns: repeat(
        auto-fit,
        minmax(min(100%, calc(var(--unit-10) * 6)), 1fr)
    );
}

/* The .card molecule caps itself at 30rem (--unit-10 * 6). Drop it here so a
   card can grow past that and fill its track. */
.my-section .card-list > .card {
    max-width: none;
}
```

That's it. Scope both rules under your page/section root so you don't change
`.card-list` or `.card` globally.

## Why each piece matters

- **`auto-fit`** (not `auto-fill`): when there are fewer cards than tracks that
  would fit, `auto-fit` **collapses the empty tracks to zero** so the `1fr`
  space is split among the real cards. `auto-fill` keeps the phantom tracks and
  the cards stay pinned to their min width, leaving the gap. Full-width fill
  requires `auto-fit`.
- **`minmax(min(100%, <card>), 1fr)`**: the min is the card's natural width
  (`--unit-10 * 6` = 30rem) so a new column only appears once a whole extra card
  fits — the `min(100%, …)` guard lets it shrink below 30rem on very narrow
  screens instead of overflowing. The max is `1fr`, which is what makes existing
  tracks **stretch to consume leftover space** instead of stopping at 30rem.
- **`.card { max-width: none }`**: the library `.card` molecule
  (`ui/library/src/components/molecules/card/styles.css`) hard-caps at
  `calc(var(--unit-10) * 6)`. Without overriding it, the grid track grows but the
  card inside stays 30rem — the space just moves inside the track. You must drop
  the card cap too.

## Why no media / container queries

The grid is **intrinsic**: it responds to the real width of the list, not the
viewport. That matters because the card list lives inside `.app-layout__content`,
which the desktop nav sidebar narrows — a viewport `@media` breakpoint would
mis-fire (a card can still be single-column-narrow at a "laptop" viewport once
the sidebar eats the width). The intrinsic grid sizes off the actual container,
so it is correct by construction with zero breakpoints to maintain.

Related gotcha for the curious: **`var()` is not allowed inside `@media` /
`@container` conditions** — the browser does not resolve custom properties when
evaluating a query. So a token-driven breakpoint (`@container (width < calc(var(...)))`)
silently fails and you are forced into a literal. Avoiding queries sidesteps
this entirely.

## Verifying

Drive the page at several widths and assert each row spans the list width
(minus the grid gap). See the browser harness in
`.claude/skills/k9x-browser-test`; a throwaway measure script:

```js
export default async (page, { log }) => {
  for (const w of [400, 700, 976, 1400, 1800]) {
    await page.setViewportSize({ width: w, height: 900 });
    await page.waitForTimeout(400);
    const info = await page.evaluate(() => {
      const list = document.querySelector(".card-list");
      const cards = [...document.querySelectorAll(".card-list > .card")];
      const top = Math.round(cards[0].getBoundingClientRect().top);
      const row = cards.filter((c) => Math.round(c.getBoundingClientRect().top) === top);
      const listW = Math.round(list.getBoundingClientRect().width);
      const fill = row.reduce((a, c) => a + Math.round(c.getBoundingClientRect().width), 0);
      return { listW, cols: row.length, fill };
    });
    log(`w=${w} | list=${info.listW} | cols=${info.cols} | rowFill=${info.fill}`);
  }
};
```

`rowFill` should equal `list` for a single column, and `list − gap*(cols−1)`
for multiple columns (gap is `--unit-2` = 1rem).

## Sizing knobs

- **Card min width** (when a new column appears): change the `--unit-10 * 6`
  in both the `minmax` min **and** conceptually match whatever the card should
  never go below. Keep it in `--unit-*` tokens, not raw `rem`.
- **Gap**: inherited from `.card-list` (`--unit-2`); override on your scoped
  `.card-list` if needed.
