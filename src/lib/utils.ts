import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { StrapiBlock } from '@/lib/strapi';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const normalizeTurkish = (str: string): string => {
	if (!str) return '';
	return str
		.toLowerCase()
		.replaceAll('ğ', 'g')
		.replaceAll('ü', 'u')
		.replaceAll('ş', 's')
		.replaceAll('ı', 'i')
		.replaceAll('ö', 'o')
		.replaceAll('ç', 'c');
};

function extractNodeText(node: any): string {
	if (typeof node?.text === 'string') return node.text;
	if (!Array.isArray(node?.children)) return '';
	return node.children.map(extractNodeText).join('');
}

export const extractTextFromBlocks = (blocks?: StrapiBlock[] | null): string => {
	if (!blocks || !Array.isArray(blocks)) return '';
	return blocks.map((block) => extractNodeText(block)).join('\n\n');
};

export function extractYouTubeVideoId(url?: string | null): string | null {
	if (!url) return null;
	if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;

	try {
		const parsed = new URL(url);
		const hostname = parsed.hostname.replace(/^www\./, '');
		let id: string | null = null;
		if (hostname === 'youtu.be') id = parsed.pathname.split('/').filter(Boolean)[0] ?? null;
		if (
			hostname === 'youtube.com' ||
			hostname === 'm.youtube.com' ||
			hostname === 'youtube-nocookie.com'
		) {
			if (parsed.pathname === '/watch') id = parsed.searchParams.get('v');
			else {
				const match = /^\/(?:embed|shorts|live|v)\/([^/?#]+)/.exec(parsed.pathname);
				id = match?.[1] ?? null;
			}
		}
		return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
	} catch {
		return null;
	}
}

export function parseCSVLine(line: string): string[] | null {
	const result: string[] = [];
	let i = 0;
	let field = '';
	let inQuotes = false;

	while (i < line.length) {
		const char = line[i];

		if (inQuotes) {
			if (char === '"' && i + 1 < line.length && line[i + 1] === '"') {
				field += '"';
				i += 2;
			} else if (char === '"') {
				inQuotes = false;
				i++;
			} else {
				field += char;
				i++;
			}
		} else if (char === '"') {
			inQuotes = true;
			i++;
		} else if (char === ',') {
			result.push(field.trim());
			field = '';
			i++;
		} else {
			field += char;
			i++;
		}
	}

	result.push(field.trim());

	return result;
}

export function generateSimpleId(): string {
	return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/** `crypto.randomUUID` is unavailable on Hermes; this matches the web submission-id shape. */
export function generateUuid(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0;
		const v = c === 'x' ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
}

/** Course duration in minutes rendered the way the web app does ("1h 30m" / "45m"). */
export function formatDuration(minutes?: number | null): string {
	const total = Math.max(0, Math.round(minutes ?? 0));
	if (!total) return '0m';
	const hours = Math.floor(total / 60);
	const mins = total % 60;
	if (!hours) return `${mins}m`;
	return mins ? `${hours}h ${mins}m` : `${hours}h`;
}

const TR_MONTHS = [
	'Ocak',
	'Şubat',
	'Mart',
	'Nisan',
	'Mayıs',
	'Haziran',
	'Temmuz',
	'Ağustos',
	'Eylül',
	'Ekim',
	'Kasım',
	'Aralık',
];

/**
 * Hermes' Intl coverage is partial, so Turkish dates are formatted by hand rather than with
 * `toLocaleDateString('tr-TR')` (which silently falls back to an English layout).
 */
export function formatDateTR(value?: string | Date | null, long = false): string {
	if (!value) return '';
	const date = value instanceof Date ? value : new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	if (long) return `${date.getDate()} ${TR_MONTHS[date.getMonth()]} ${date.getFullYear()}`;
	return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1)
		.toString()
		.padStart(2, '0')}.${date.getFullYear()}`;
}

/** tr-TR thousands separator ("1234" → "1.234"). */
export function formatNumberTR(value?: number | null): string {
	if (value == null) return '';
	const [int, dec] = value.toString().split('.');
	const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
	return dec ? `${grouped},${dec}` : grouped;
}

/** mm:ss, used by the exam countdown. */
export function formatClock(totalSeconds: number): string {
	const seconds = Math.max(0, Math.floor(totalSeconds));
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

/**
 * Turns a phone number as typed in Strapi ("0555 123 45 67", "+90 555…", "555-123-45-67")
 * into international digits ("905551234567"). Returns null when it isn't a usable number.
 */
export function toInternationalDigits(phone?: string | null): string | null {
	let digits = (phone ?? '').replace(/\D/g, '');
	if (!digits) return null;
	if (digits.startsWith('00')) digits = digits.slice(2);
	// Turkish numbers written nationally: 0 5xx… or 5xx…
	if (digits.length === 11 && digits.startsWith('0')) digits = `90${digits.slice(1)}`;
	if (digits.length === 10 && digits.startsWith('5')) digits = `90${digits}`;
	return digits.length >= 10 ? digits : null;
}

export function whatsappUrl(phone: string | null | undefined, message: string): string | null {
	const digits = toInternationalDigits(phone);
	return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : null;
}

export function telUrl(phone?: string | null): string | null {
	const digits = toInternationalDigits(phone);
	return digits ? `tel:+${digits}` : null;
}

/** Pre-filled first WhatsApp message to a tutor. */
export function tutorWhatsappMessage(tutorName: string) {
	return `Merhaba ${tutorName}, KetaLearn üzerinden ulaşıyorum. Ücretsiz deneme dersi hakkında bilgi almak istiyorum.`;
}
