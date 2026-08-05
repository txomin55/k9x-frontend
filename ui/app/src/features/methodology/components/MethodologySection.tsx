import { type JSX } from "solid-js";

type Props = {
  discipline: "k9x" | "obdx";
  eyebrow: string;
  title: string;
  lede: string;
  note: string;
  children: JSX.Element;
};

export default function MethodologySection(props: Props) {
  return (
    <section class="methodology-page__section">
      <div
        class={`methodology-page__eyebrow methodology-page__eyebrow--${props.discipline}`}
      >
        {props.eyebrow}
      </div>
      <h2 class="methodology-page__section-title">{props.title}</h2>
      <p class="methodology-page__lede">{props.lede}</p>
      {props.children}
      <p
        class={`methodology-page__note methodology-page__note--${props.discipline}`}
      >
        {props.note}
      </p>
    </section>
  );
}
