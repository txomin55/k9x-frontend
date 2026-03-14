const normalizeBasePath = (value) => {
  if (!value) return "";
  return value.endsWith("/") ? value.slice(0, -1) : value;
};

export const getBasePath = () =>
  normalizeBasePath(import.meta.env.VITE_APP_BASE_PATH ?? "");

export const stripBasePath = (pathname = "/") => {
  const normalizedPathname = pathname || "/";
  const basePath = getBasePath();

  if (!basePath) return normalizedPathname;
  if (normalizedPathname === basePath) return "/";
  if (normalizedPathname.startsWith(`${basePath}/`)) {
    return normalizedPathname.slice(basePath.length) || "/";
  }

  return normalizedPathname;
};

export const resolveAppPath = (pathname = "/") => {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const basePath = getBasePath();
  return `${basePath}${normalizedPath}` || "/";
};
