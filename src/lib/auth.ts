import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { safeAppReturnPath } from '@/lib/routes';
import { secureStorage } from '@/lib/storage';
import { STRAPI_URL } from '@/lib/strapi';

WebBrowser.maybeCompleteAuthSession();

export interface StrapiUser {
	id: number;
	documentId?: string;
	username: string;
	email: string;
	provider: string;
	confirmed: boolean;
	blocked: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface StrapiAuthResponse {
	jwt: string;
	user: StrapiUser;
}

export interface AuthError {
	error: {
		status: number;
		name: string;
		message: string;
		details?: any;
	};
}

interface PendingGoogleAuth {
	redirectUri: string;
	state: string;
	returnTo?: string;
}

export type GoogleAuthCallback =
	| { jwt: string; user: StrapiUser; returnTo: string | null }
	| { error: string };

const PENDING_GOOGLE_AUTH_KEY = 'keta-google-auth-state';
const GOOGLE_AUTH_SCHEME = 'ketaakademi';

function createOAuthState(): string {
	if (!globalThis.crypto?.getRandomValues) {
		throw new Error('Secure OAuth state generation is unavailable');
	}
	const bytes = new Uint8Array(16);
	globalThis.crypto.getRandomValues(bytes);
	return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

export async function clearPendingGoogleAuth(): Promise<void> {
	await secureStorage.removeItem(PENDING_GOOGLE_AUTH_KEY);
}

export async function signInWithGoogle(returnTo?: string | null) {
	const state = createOAuthState();
	const redirectUri = Linking.createURL(`/auth-callback/${state}`, {
		scheme: GOOGLE_AUTH_SCHEME,
	});
	const safeReturnTo = safeAppReturnPath(returnTo);
	await secureStorage.setItem(
		PENDING_GOOGLE_AUTH_KEY,
		JSON.stringify({
			redirectUri,
			state,
			...(safeReturnTo ? { returnTo: safeReturnTo } : {}),
		} satisfies PendingGoogleAuth),
	);

	const authUrl = `${STRAPI_URL}/api/auth/google?mobile=true&redirect=${encodeURIComponent(redirectUri)}`;
	try {
		return await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
	} catch (error) {
		await clearPendingGoogleAuth();
		throw error;
	}
}

function isStrapiUser(value: unknown): value is StrapiUser {
	if (!value || typeof value !== 'object') return false;
	const user = value as Partial<StrapiUser>;
	return (
		typeof user.id === 'number' &&
		typeof user.username === 'string' &&
		typeof user.email === 'string' &&
		typeof user.provider === 'string' &&
		typeof user.confirmed === 'boolean' &&
		typeof user.blocked === 'boolean' &&
		typeof user.createdAt === 'string' &&
		typeof user.updatedAt === 'string'
	);
}

export async function completeGoogleSignIn(url: string): Promise<GoogleAuthCallback | null> {
	const stored = await secureStorage.getItem(PENDING_GOOGLE_AUTH_KEY);
	if (!stored) return null;

	let pending: PendingGoogleAuth;
	try {
		pending = JSON.parse(stored) as PendingGoogleAuth;
	} catch {
		await clearPendingGoogleAuth();
		return null;
	}

	if (
		typeof pending.redirectUri !== 'string' ||
		typeof pending.state !== 'string' ||
		!pending.state ||
		url.split('?')[0] !== pending.redirectUri
	) {
		return null;
	}

	await clearPendingGoogleAuth();
	const { queryParams } = Linking.parse(url);
	if (queryParams?.success === 'false' || typeof queryParams?.error === 'string') {
		return { error: 'Google ile giriş yapılamadı. Lütfen tekrar deneyin.' };
	}

	const token = queryParams?.token ?? queryParams?.jwt;
	const serializedUser = queryParams?.user;
	if (typeof token !== 'string' || !token || typeof serializedUser !== 'string') {
		return { error: 'Google giriş yanıtı eksik veya geçersiz.' };
	}

	try {
		const user: unknown = JSON.parse(serializedUser);
		if (!isStrapiUser(user)) return { error: 'Google kullanıcı bilgileri geçersiz.' };
		return { jwt: token, user, returnTo: safeAppReturnPath(pending.returnTo) };
	} catch {
		return { error: 'Google kullanıcı bilgileri okunamadı.' };
	}
}

export async function getCurrentUser(jwt: string): Promise<StrapiUser | null> {
	const response = await fetch(`${STRAPI_URL}/api/users/me`, {
		headers: {
			Authorization: `Bearer ${jwt}`,
			'Content-Type': 'application/json',
		},
	});

	if (response.status === 401 || response.status === 403) return null;
	if (!response.ok) {
		throw new Error(`Current user request failed: ${response.status}`);
	}
	return (await response.json()) as StrapiUser;
}

export function convertStrapiUser(strapiUser: StrapiUser): {
	id: string;
	email: string;
	name: string;
	picture?: string;
	verified: boolean;
} {
	return {
		email: strapiUser.email,
		name: strapiUser.username,
		verified: strapiUser.confirmed,
		id: strapiUser.id.toString(),
		picture: undefined,
	};
}
