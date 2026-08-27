export function buildNameMatcher(query: string): (name: string) => boolean {
  const trimmed = query.trim();
  if (!trimmed) return () => true;

  let matcher: RegExp;
  try {
    matcher = new RegExp(trimmed, "i");
  } catch {
    const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    matcher = new RegExp(escaped, "i");
  }

  return (name: string) => matcher.test(name ?? "");
}

/**
 * Case-insensitive "name contains" matcher, mirroring what the API does when a name filter travels in
 * the query. Used to keep locally added or edited entries in step with a server-filtered list.
 */
export function buildNameContainsMatcher(
  query: string,
): (name: string) => boolean {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return () => true;

  return (name: string) => (name ?? "").toLowerCase().includes(trimmed);
}
