/**
 * WhatsApp-style light formatting for organizer-written text (stage announcements).
 *
 * The text stays a plain string everywhere — API, push metadata, offline queue — and the markers are only
 * interpreted when rendering, exactly like WhatsApp does. Supported: `*bold*`, `_italic_`, `~strike~`,
 * lines starting with `-` or `•` as bullets, and bare http(s) URLs turned into links.
 *
 * The parser returns nodes (never markup) so the renderer can build DOM elements: the text comes from one
 * user and is read by many, so it must never reach `innerHTML`. Links are only ever produced from the URL
 * pattern below, so a `javascript:` href cannot be authored.
 */

export type RichTextInline =
  | { kind: "text"; text: string }
  | { kind: "link"; href: string; text: string }
  | { kind: "bold" | "italic" | "strike"; children: RichTextInline[] };

export type RichTextBlock =
  | { kind: "paragraph"; children: RichTextInline[] }
  | { kind: "list"; items: RichTextInline[][] };

const MARKERS: Record<string, "bold" | "italic" | "strike"> = {
  "*": "bold",
  _: "italic",
  "~": "strike",
};

const URL_PATTERN = /https?:\/\/[^\s]+/g;
/** Sentence punctuation right after a link belongs to the sentence, not to the URL. */
const URL_TRAILING_PUNCTUATION = /[.,;:!?)\]}'"]+$/;
const LIST_ITEM_PATTERN = /^\s*[-•]\s+(.*)$/;
const BULLET_PREFIX = "• ";

/** The closing marker cannot sit right after a space, so `*a * b*` closes at the last `*`, not the middle one. */
const findClosingMarker = (text: string, marker: string, from: number) => {
  for (let index = from; index < text.length; index += 1) {
    if (text[index] === marker && text[index - 1] !== " ") return index;
  }

  return -1;
};

const parseMarkers = (text: string): RichTextInline[] => {
  const nodes: RichTextInline[] = [];
  let buffer = "";
  let index = 0;

  const flushBuffer = () => {
    if (!buffer) return;

    nodes.push({ kind: "text", text: buffer });
    buffer = "";
  };

  while (index < text.length) {
    const character = text[index];
    const kind = MARKERS[character];
    const opensMarker =
      Boolean(kind) && index + 1 < text.length && text[index + 1] !== " ";
    const closingIndex = opensMarker
      ? findClosingMarker(text, character, index + 1)
      : -1;

    if (kind && closingIndex > index + 1) {
      flushBuffer();
      nodes.push({
        kind,
        children: parseMarkers(text.slice(index + 1, closingIndex)),
      });
      index = closingIndex + 1;
      continue;
    }

    buffer += character;
    index += 1;
  }

  flushBuffer();

  return nodes;
};

/**
 * URLs are taken out first so their `_` or `~` characters cannot be read as markers. The trade-off is that a
 * link inside `*…*` is not bolded, which is the safe side of the bargain.
 */
const parseInline = (text: string): RichTextInline[] => {
  const nodes: RichTextInline[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_PATTERN)) {
    const matched = match[0];
    const trailing = URL_TRAILING_PUNCTUATION.exec(matched)?.[0] ?? "";
    const href = matched.slice(0, matched.length - trailing.length);
    const start = match.index ?? 0;

    if (!href) continue;

    nodes.push(...parseMarkers(text.slice(lastIndex, start)));
    nodes.push({ kind: "link", href, text: href });
    lastIndex = start + href.length;
  }

  nodes.push(...parseMarkers(text.slice(lastIndex)));

  return nodes;
};

export const parseRichText = (content: string): RichTextBlock[] => {
  const blocks: RichTextBlock[] = [];

  for (const line of content.split(/\r?\n/)) {
    const listItem = LIST_ITEM_PATTERN.exec(line);

    if (listItem) {
      const previous = blocks.at(-1);
      const item = parseInline(listItem[1]);

      if (previous?.kind === "list") previous.items.push(item);
      else blocks.push({ kind: "list", items: [item] });

      continue;
    }

    if (!line.trim()) continue;

    blocks.push({ kind: "paragraph", children: parseInline(line) });
  }

  return blocks;
};

const inlineToPlainText = (nodes: RichTextInline[]): string =>
  nodes
    .map((node) => {
      if (node.kind === "text") return node.text;
      if (node.kind === "link") return node.text;

      return inlineToPlainText(node.children);
    })
    .join("");

/**
 * The same text without its markers, for the places that can only show plain text — a Web Push body cannot
 * render markup, so `*hola*` would otherwise reach the notification tray with the asterisks in it.
 */
export const stripRichTextMarkers = (content: string): string =>
  parseRichText(content)
    .map((block) =>
      block.kind === "paragraph"
        ? inlineToPlainText(block.children)
        : block.items
            .map((item) => `${BULLET_PREFIX}${inlineToPlainText(item)}`)
            .join("\n"),
    )
    .join("\n");
