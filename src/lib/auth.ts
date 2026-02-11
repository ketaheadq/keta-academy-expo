// Strapi authentication utilities for Mobile
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

const STRAPI_URL = process.env.EXPO_PUBLIC_STRAPI_URL;

export interface StrapiUser {
	id: number;
	documentId: string;
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

export function getGoogleAuthUrl(): string {
	if (!STRAPI_URL) {
		throw new Error('EXPO_PUBLIC_STRAPI_URL environment variable is required');
	}

	// For mobile, we might need to pass a redirect URI that points back to the app
	const redirectUri = Linking.createURL('/auth-callback');
	return `${STRAPI_URL}/api/auth/google?mobile=true&redirectUri=${encodeURIComponent(redirectUri)}`;
}

export async function signInWithGoogle() {
	const authUrl = getGoogleAuthUrl();
	const result = await WebBrowser.openAuthSessionAsync(
		authUrl,
		Linking.createURL('/auth-callback'),
	);
	return result;
}

export async function getCurrentUser(jwt: string): Promise<StrapiUser | null> {
	try {
		if (!STRAPI_URL) return null;

		const response = await fetch(`${STRAPI_URL}/api/users/me`, {
			headers: {
				Authorization: `Bearer ${jwt}`,
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			return null;
		}

		return await response.json();
	} catch (error) {
		console.error('Error fetching current user:', error);
		return null;
	}
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
