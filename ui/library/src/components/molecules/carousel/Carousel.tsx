import { createSignal, For, Show, type JSX } from "solid-js";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import "./styles.css";

export type CarouselProps = {
  items: JSX.Element[];
  initialIndex?: number;
  onChange?: (index: number) => void;
};

export default function Carousel(props: CarouselProps) {
  const clamp = (index: number) =>
    Math.min(Math.max(index, 0), props.items.length - 1);

  const [current, setCurrent] = createSignal(clamp(props.initialIndex ?? 0));

  const goTo = (index: number) => {
    const next = clamp(index);
    setCurrent(next);
    props.onChange?.(next);
  };

  const isFirst = () => current() <= 0;
  const isLast = () => current() >= props.items.length - 1;

  return (
    <div class="carousel">
      <div class="carousel__control carousel__control--prev">
        <Show when={!isFirst()}>
          <CircleButton onClick={() => goTo(current() - 1)}>‹</CircleButton>
        </Show>
      </div>

      <div class="carousel__viewport">
        <div
          class="carousel__track"
          style={{ transform: `translateX(-${current() * 100}%)` }}
        >
          <For each={props.items}>
            {(item) => <div class="carousel__slide">{item}</div>}
          </For>
        </div>
      </div>

      <div class="carousel__control carousel__control--next">
        <Show when={!isLast()}>
          <CircleButton onClick={() => goTo(current() + 1)}>›</CircleButton>
        </Show>
      </div>
    </div>
  );
}
