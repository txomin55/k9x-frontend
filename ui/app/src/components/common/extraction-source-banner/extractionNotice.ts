import { createEffect, createSignal, onCleanup } from "solid-js";
import type { ExtractionResponseDTO } from "@/services/fetch-stages/fetchStages.types";

export interface ExtractionNotice {
  extraction: ExtractionResponseDTO;
  context: string;
}

const [notices, setNotices] = createSignal<
  { id: symbol; notice: ExtractionNotice }[]
>([]);

export const currentExtractionNotice = () => notices().at(-1)?.notice ?? null;

export function useExtractionNotice(source: () => ExtractionNotice | null) {
  const id = Symbol("extraction-notice");
  const remove = () =>
    setNotices((list) => list.filter((entry) => entry.id !== id));

  createEffect(() => {
    const notice = source();
    if (!notice) {
      remove();
      return;
    }
    setNotices((list) => {
      const index = list.findIndex((entry) => entry.id === id);
      if (index === -1) return [...list, { id, notice }];
      const next = [...list];
      next[index] = { id, notice };
      return next;
    });
  });

  onCleanup(remove);
}
