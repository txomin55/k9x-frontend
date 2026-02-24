export const isLocal =
  process.env.VITE_APP_ENV !== "integrated" ||
  process.env.VITE_APP_ENV !== "production";
