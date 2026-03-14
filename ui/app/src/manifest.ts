const normalizeBasePath = (value?: string) => {
  if (!value) return "";
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

const toManifestPath = (basePath: string) => (basePath ? `${basePath}/` : "./");

export const createWebManifest = (basePathEnv?: string) => {
  const basePath = normalizeBasePath(basePathEnv);
  const rootPath = toManifestPath(basePath);

  return {
    name: "Dog Trainer App",
    short_name: "DogTrainer",
    description: "Dog trainer PWA",
    start_url: rootPath,
    scope: rootPath,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: `${rootPath}pwa-192x192.png`,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: `${rootPath}pwa-512x512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };
};
