import { createMemo, createSignal, For, Show } from "solid-js";
import Carousel from "@lib/components/molecules/carousel/Carousel";
import { useI18n } from "@/stores/i18n/i18n";
import "@/components/common/breadcrumb-info/styles.css";

export type BreadcrumbInfoBlock = {
  keys: string[];
  image?: string;
};

export type BreadcrumbInfoSlide = BreadcrumbInfoBlock[];

export type BreadcrumbInfoSlidesProps = {
  slides: BreadcrumbInfoSlide[];
};

export default function BreadcrumbInfoSlides(props: BreadcrumbInfoSlidesProps) {
  const i18n = useI18n();

  const [current, setCurrent] = createSignal(0);

  const isNearby = (index: number) => Math.abs(index - current()) <= 1;

  const renderSlide = (slide: BreadcrumbInfoSlide, index: number) => (
    <div class="breadcrumb-info-slide">
      <For each={slide}>
        {(block) => (
          <>
            <Show when={isNearby(index) ? block.image : undefined}>
              {(image) => (
                <img
                  class="breadcrumb-info-slide__image"
                  src={image()}
                  alt={i18n.t(block.keys[0])}
                  loading="lazy"
                  decoding="async"
                />
              )}
            </Show>
            <For each={block.keys}>
              {(key) => (
                <p class="breadcrumb-info-slide__text" innerHTML={i18n.t(key)} />
              )}
            </For>
          </>
        )}
      </For>
    </div>
  );

  const renderedSlides = createMemo(() =>
    props.slides.map((slide, index) => renderSlide(slide, index)),
  );

  return (
    <Show
      when={props.slides.length > 1}
      fallback={renderSlide(props.slides[0], 0)}
    >
      <Carousel
        items={renderedSlides()}
        onChange={setCurrent}
        label={i18n.t("COMMON.PAGE_INFORMATION")}
        previousLabel={i18n.t("COMMON.CAROUSEL_PREVIOUS")}
        nextLabel={i18n.t("COMMON.CAROUSEL_NEXT")}
      />
    </Show>
  );
}
