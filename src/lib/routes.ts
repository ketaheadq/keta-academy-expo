/**
 * Maps a web-app path (what Strapi editors type into `link` fields) onto the equivalent
 * expo-router route. The course listing is a tab named `courses`, so `/kurslar` needs rewriting;
 * every other web path has a native screen at the same path.
 */
export function toAppRoute(link?: string | null): string | null {
	if (!link) return null;
	if (/^https?:\/\//.test(link)) return link;
	if (link === '/kurslar') return '/courses';
	if (link.startsWith('/kurslar/')) return `/courses/${link.slice('/kurslar/'.length)}`;
	return link;
}
