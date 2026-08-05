import { type JSX } from "solid-js";

type Props = {
  brand: string;
  discipline: "k9x" | "obdx";
  title: string;
  subtitle: string;
  children?: JSX.Element;
};

export default function MethodologyHeader(props: Props) {
  return (
    <header class="methodology-page__header">
      <div
        class={`methodology-page__brand methodology-page__brand--${props.discipline}`}
      >
        {props.brand}
      </div>
      <h1 class="methodology-page__title">{props.title}</h1>
      <p class="methodology-page__subtitle">{props.subtitle}</p>
      {props.children}
    </header>
  );
}
