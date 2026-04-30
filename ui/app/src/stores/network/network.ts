import { createAppStore } from "@/utils/store/createAppStore";

type NetworkState = {
  online: boolean;
};

const getInitialOnlineState = () =>
  typeof globalThis === "undefined" || !("navigator" in globalThis)
    ? true
    : globalThis.navigator.onLine;

const { setState, useAppStore } = createAppStore<NetworkState>({
  online: getInitialOnlineState(),
});

let initialized = false;

const syncOnlineState = () => {
  setState(() => ({
    online: getInitialOnlineState(),
  }));
};

const initNetworkStore = () => {
  if (initialized || typeof globalThis === "undefined") return;

  initialized = true;
  globalThis.addEventListener("online", syncOnlineState);
  globalThis.addEventListener("offline", syncOnlineState);
  syncOnlineState();
};

const useOffline = () => {
  const online = useAppStore((state) => state.online);

  return {
    isOffline: () => !online(),
  };
};

export { initNetworkStore, useOffline };
