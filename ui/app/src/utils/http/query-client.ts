import { QueryClient } from "@tanstack/solid-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const setupQueryRefetchOnReconnect = () => {
  const handleOnline = () => {
    queryClient.refetchQueries({
      stale: true,
      type: "all",
    });
  };

  globalThis.addEventListener("online", handleOnline);

  return () => {
    globalThis.removeEventListener("online", handleOnline);
  };
};
