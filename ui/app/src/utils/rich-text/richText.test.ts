import { describe, expect, it } from "vitest";
import {
  parseRichText,
  stripRichTextMarkers,
  type RichTextBlock,
} from "@/utils/rich-text/richText";

const paragraph = (blocks: RichTextBlock[]) => {
  const [block] = blocks;
  if (block?.kind !== "paragraph") throw new Error("expected a paragraph");

  return block.children;
};

describe("parseRichText", () => {
  it("marks bold, italic and strikethrough runs", () => {
    expect(paragraph(parseRichText("a *b* _c_ ~d~"))).toEqual([
      { kind: "text", text: "a " },
      { kind: "bold", children: [{ kind: "text", text: "b" }] },
      { kind: "text", text: " " },
      { kind: "italic", children: [{ kind: "text", text: "c" }] },
      { kind: "text", text: " " },
      { kind: "strike", children: [{ kind: "text", text: "d" }] },
    ]);
  });

  it("nests markers", () => {
    expect(paragraph(parseRichText("*_both_*"))).toEqual([
      {
        kind: "bold",
        children: [
          { kind: "italic", children: [{ kind: "text", text: "both" }] },
        ],
      },
    ]);
  });

  it("keeps unpaired and space-hugging markers as literal text", () => {
    expect(paragraph(parseRichText("2 * 3 = 6"))).toEqual([
      { kind: "text", text: "2 * 3 = 6" },
    ]);
    expect(paragraph(parseRichText("a * b"))).toEqual([
      { kind: "text", text: "a * b" },
    ]);
  });

  it("links bare http(s) urls and leaves trailing punctuation out", () => {
    expect(paragraph(parseRichText("see https://k9x.app/a_b."))).toEqual([
      { kind: "text", text: "see " },
      {
        kind: "link",
        href: "https://k9x.app/a_b",
        text: "https://k9x.app/a_b",
      },
      { kind: "text", text: "." },
    ]);
  });

  it("does not turn other schemes into links", () => {
    expect(paragraph(parseRichText("javascript:alert(1)"))).toEqual([
      { kind: "text", text: "javascript:alert(1)" },
    ]);
  });

  it("groups consecutive dash or bullet lines into one list", () => {
    expect(parseRichText("Plan\n- one\n• two\nEnd")).toEqual([
      { kind: "paragraph", children: [{ kind: "text", text: "Plan" }] },
      {
        kind: "list",
        items: [
          [{ kind: "text", text: "one" }],
          [{ kind: "text", text: "two" }],
        ],
      },
      { kind: "paragraph", children: [{ kind: "text", text: "End" }] },
    ]);
  });

  it("ignores blank lines", () => {
    expect(parseRichText("a\n\n \nb")).toHaveLength(2);
  });
});

describe("stripRichTextMarkers", () => {
  it("drops the markers and keeps the readable text", () => {
    expect(stripRichTextMarkers("*Ring 1* moved, see _the plan_")).toBe(
      "Ring 1 moved, see the plan",
    );
  });

  it("keeps bullets readable and preserves line breaks", () => {
    expect(stripRichTextMarkers("Changes:\n- *one*\n- two")).toBe(
      "Changes:\n• one\n• two",
    );
  });

  it("keeps the url of a link", () => {
    expect(stripRichTextMarkers("at https://k9x.app/x")).toBe(
      "at https://k9x.app/x",
    );
  });
});
