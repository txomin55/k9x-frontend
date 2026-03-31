import { QueryClient } from "@tanstack/solid-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
    },
  },
});

export const setupQueryRefetchOnReconnect = () => {
  const handleOnline = async () => {
    await queryClient.refetchQueries({
      stale: true,
      type: "all",
    });
  };

  globalThis.addEventListener("online", handleOnline);

  return () => {
    globalThis.removeEventListener("online", handleOnline);
  };
};
