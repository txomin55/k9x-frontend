import { createSignal, For, onCleanup, onMount, Show, type JSX } from "solid-js";
import CircleButton from "@lib/components/molecules/circle-button/CircleButton";
import "./styles.css";

export type CarouselProps = {
  items: JSX.Element[];
  initialIndex?: number;
  onChange?: (index: number) => void;
  label?: string;
  previousLabel?: string;
  nextLabel?: string;
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

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowLeft") goTo(current() - 1);
    if (event.key === "ArrowRight") goTo(current() + 1);
  };

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
    onCleanup(() => window.removeEventListener("keydown", handleKeyDown));
  });

  return (
    <div
      class="carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={props.label}
      tabindex="0"
    >
      <div class="carousel__control carousel__control--prev">
        <Show when={!isFirst()}>
          <CircleButton
            onClick={() => goTo(current() - 1)}
            ariaLabel={props.previousLabel ?? "Previous slide"}
          >
            <span aria-hidden="true">‹</span>
          </CircleButton>
        </Show>
      </div>

      <div class="carousel__viewport" aria-live="polite">
        <div
          class="carousel__track"
          style={{ transform: `translateX(-${current() * 100}%)` }}
        >
          <For each={props.items}>
            {(item, idx) => (
              <div class="carousel__slide" aria-hidden={idx() !== current()}>
                {item}
              </div>
            )}
          </For>
        </div>
      </div>

      <div class="carousel__control carousel__control--next">
        <Show when={!isLast()}>
          <CircleButton
            onClick={() => goTo(current() + 1)}
            ariaLabel={props.nextLabel ?? "Next slide"}
          >
            <span aria-hidden="true">›</span>
          </CircleButton>
        </Show>
      </div>
    </div>
  );
}
