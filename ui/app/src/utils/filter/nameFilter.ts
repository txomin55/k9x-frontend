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
