import { For, Show } from "solid-js";
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

  const renderSlide = (slide: BreadcrumbInfoSlide) => (
    <div class="breadcrumb-info-slide">
      <For each={slide}>
        {(block) => (
          <>
            <Show when={block.image}>
              {(image) => (
                <img
                  class="breadcrumb-info-slide__image"
                  src={image()}
                  alt={i18n.t(block.keys[0])}
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

  return (
    <Show
      when={props.slides.length > 1}
      fallback={renderSlide(props.slides[0])}
    >
      <Carousel items={props.slides.map(renderSlide)} />
    </Show>
  );
}
