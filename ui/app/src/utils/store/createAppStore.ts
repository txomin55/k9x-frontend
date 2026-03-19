import { useStore } from "@tanstack/solid-store";
import { Store } from "@tanstack/store";

type StoreUpdater<TState> = (state: TState) => TState;

const createAppStore = <TState>(initialState: TState) => {
  const store = new Store<TState>(initialState);

  const getState = () => store.state;
  const setState = (updater: StoreUpdater<TState>) => {
    store.setState(updater);
  };
  const useAppStore = <TSelected>(
    selector: (state: TState) => TSelected,
  ) => useStore(store, selector);

  return {
    getState,
    setState,
    store,
    useAppStore,
  };
};

export { createAppStore };
