import type { Href } from 'expo-router';

export function appHref(path: string): Href {
	return path as Href;
}

export function safeAppReturnPath(value: unknown): string | null {
	if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return null;
	try {
		const parsed = new URL(value, 'https://ketaakademi.app');
		if (parsed.origin !== 'https://ketaakademi.app') return null;
		if (parsed.pathname === '/giris' || parsed.pathname === '/kayit-ol') return null;
		if (parsed.pathname.startsWith('/auth-callback/')) return null;
		return `${parsed.pathname}${parsed.search}${parsed.hash}`;
	} catch {
		return null;
	}
}

export function withAppReturn(path: string, returnTo?: string | null): Href {
	const safeReturnTo = safeAppReturnPath(returnTo);
	if (!safeReturnTo) return appHref(path);
	return appHref(
		`${path}${path.includes('?') ? '&' : '?'}returnTo=${encodeURIComponent(safeReturnTo)}`,
	);
}

/**
 * Maps a web-app path (what Strapi editors type into `link` fields) onto the equivalent
 * expo-router route. The course listing is a tab named `courses`, so `/kurslar` needs rewriting;
 * every other web path has a native screen at the same path.
 */
export function toAppRoute(link?: string | null): string | null {
	if (!link) return null;
	if (/^https?:\/\//.test(link)) return link;
	const suffixIndex = link.search(/[?#]/);
	const path = suffixIndex === -1 ? link : link.slice(0, suffixIndex);
	const suffix = suffixIndex === -1 ? '' : link.slice(suffixIndex);
	if (path === '/kurslar') return `/courses${suffix}`;
	if (path.startsWith('/kurslar/')) return `/courses/${path.slice('/kurslar/'.length)}${suffix}`;
	return link;
}
