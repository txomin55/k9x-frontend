import { createMemo, For, Match, Switch } from "solid-js";
import { parseRichText, type RichTextInline } from "@/utils/rich-text/richText";
import "./styles.css";

/**
 * Renders the light WhatsApp-style formatting of organizer-written text (see `utils/rich-text`).
 *
 * Everything is built as elements from parsed nodes — never `innerHTML` — because the text comes from one
 * user and is read by many.
 *
 * `inline` collapses the blocks into a single line (bullets become "• " prefixes) for tight spots such as a
 * table cell, where a `<ul>` would blow up the row height.
 */
type RichTextProps = {
  content: string;
  inline?: boolean;
  class?: string;
};

function InlineNodes(props: { nodes: RichTextInline[] }) {
  return (
    <For each={props.nodes}>
      {(node) => (
        <Switch>
          <Match when={node.kind === "text" && node}>
            {(textNode) => <>{textNode().text}</>}
          </Match>
          <Match when={node.kind === "link" && node}>
            {(linkNode) => (
              <a
                class="rich-text__link"
                href={linkNode().href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {linkNode().text}
              </a>
            )}
          </Match>
          <Match when={node.kind === "bold" && node}>
            {(boldNode) => (
              <b>
                <InlineNodes nodes={boldNode().children} />
              </b>
            )}
          </Match>
          <Match when={node.kind === "italic" && node}>
            {(italicNode) => (
              <i>
                <InlineNodes nodes={italicNode().children} />
              </i>
            )}
          </Match>
          <Match when={node.kind === "strike" && node}>
            {(strikeNode) => (
              <s>
                <InlineNodes nodes={strikeNode().children} />
              </s>
            )}
          </Match>
        </Switch>
      )}
    </For>
  );
}

export default function RichText(props: RichTextProps) {
  const blocks = createMemo(() => parseRichText(props.content));

  return (
    <Switch>
      <Match when={props.inline}>
        <span class={`rich-text rich-text--inline ${props.class ?? ""}`}>
          <For each={blocks()}>
            {(block) =>
              block.kind === "paragraph" ? (
                <span class="rich-text__line">
                  <InlineNodes nodes={block.children} />
                </span>
              ) : (
                <For each={block.items}>
                  {(item) => (
                    <span class="rich-text__line">
                      {"• "}
                      <InlineNodes nodes={item} />
                    </span>
                  )}
                </For>
              )
            }
          </For>
        </span>
      </Match>
      <Match when={!props.inline}>
        <div class={`rich-text ${props.class ?? ""}`}>
          <For each={blocks()}>
            {(block) =>
              block.kind === "paragraph" ? (
                <p class="rich-text__paragraph">
                  <InlineNodes nodes={block.children} />
                </p>
              ) : (
                <ul class="rich-text__list">
                  <For each={block.items}>
                    {(item) => (
                      <li>
                        <InlineNodes nodes={item} />
                      </li>
                    )}
                  </For>
                </ul>
              )
            }
          </For>
        </div>
      </Match>
    </Switch>
  );
}
