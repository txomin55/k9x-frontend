import { createSignal } from "solid-js";

/**
 * How far a paged list has got: what the server said is out there, and how many pages of it we already
 * pulled. Kept outside the query cache because it describes the *loading*, not the data.
 */
export type PagesState = {
  loadedPages: number;
  totalPages: number;
  total: number;
  isLoadingMore: boolean;
};

const EMPTY_STATE: PagesState = {
  loadedPages: 0,
  totalPages: 0,
  total: 0,
  isLoadingMore: false,
};

export const createPagesState = () => {
  const [state, setState] = createSignal<PagesState>(EMPTY_STATE);

  return {
    state,
    reset: () => setState(EMPTY_STATE),
    startLoadingMore: () =>
      setState((current) => ({ ...current, isLoadingMore: true })),
    /** Records a page that just landed. `page` is zero-based, so it loaded `page + 1` pages worth. */
    pageLoaded: (page: number, total: number, totalPages: number) =>
      setState((current) => ({
        loadedPages: Math.max(current.loadedPages, page + 1),
        totalPages,
        total,
        isLoadingMore: false,
      })),
    stopLoadingMore: () =>
      setState((current) => ({ ...current, isLoadingMore: false })),
    hasMore: () => state().loadedPages < state().totalPages,
    nextPage: () => state().loadedPages,
  };
};

export type Pages = ReturnType<typeof createPagesState>;
