/**
 * Hands a blob to the browser as a file download. Uses a temporary object URL and a synthetic anchor,
 * which is the only way to name a download that came from an authenticated fetch (a plain link cannot
 * carry the bearer token).
 */
export const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  // Revoking synchronously can cancel the download in some browsers, so it waits a tick.
  setTimeout(() => URL.revokeObjectURL(url), 0);
};
