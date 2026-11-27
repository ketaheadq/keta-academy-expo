import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
	clearPendingGoogleAuth,
	completeGoogleSignIn,
	convertStrapiUser,
	getCurrentUser,
	signInWithGoogle as googleSignIn,
	type StrapiUser,
} from '@/lib/auth';
import { secureStorage } from '@/lib/storage';
import { setAuthExpiredHandler } from '@/lib/strapi';

interface User {
	id: string;
	email: string;
	name: string;
	picture?: string;
	verified: boolean;
}

interface AuthState {
	user: User | null;
	jwt: string | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	hasHydrated: boolean;
	error: string | null;
	returnTo: string | null;
}

interface AuthActions {
	signInWithGoogle: (returnTo?: string | null) => Promise<boolean>;
	signOut: () => Promise<void>;
	clearError: () => void;
	setLoading: (loading: boolean) => void;
	setAuth: (jwt: string, strapiUser: StrapiUser, returnTo?: string | null) => void;
	refreshUser: () => Promise<void>;
	setHydrated: (hydrated: boolean) => void;
}

type AuthStore = AuthState & AuthActions;

function isUser(value: unknown): value is User {
	if (!value || typeof value !== 'object') return false;
	const user = value as Partial<User>;
	return (
		typeof user.id === 'string' &&
		typeof user.email === 'string' &&
		typeof user.name === 'string' &&
		typeof user.verified === 'boolean'
	);
}

export const useAuthStore = create<AuthStore>()(
	persist(
		(set, get) => ({
			user: null,
			jwt: null,
			isLoading: false,
			isAuthenticated: false,
			hasHydrated: false,
			error: null,
			returnTo: null,

			signInWithGoogle: async (returnTo?: string | null) => {
				try {
					set({ isLoading: true, error: null });
					const result = await googleSignIn(returnTo);

					if (result.type !== 'success' || !result.url) {
						await clearPendingGoogleAuth();
						set({ isLoading: false });
						return false;
					}

					const callback = await completeGoogleSignIn(result.url);
					if (!callback) {
						const authenticated = get().isAuthenticated;
						set({ isLoading: false });
						return authenticated;
					}
					if ('error' in callback) {
						set({ error: callback.error, isLoading: false });
						return false;
					}

					get().setAuth(callback.jwt, callback.user, callback.returnTo);
					return true;
				} catch (error) {
					console.error('Failed to sign in with Google:', error);
					set({
						error: 'Google ile giriş yapılamadı. Lütfen tekrar deneyin.',
						isLoading: false,
					});
					return false;
				}
			},

			setAuth: (jwt: string, strapiUser: StrapiUser, returnTo: string | null = null) => {
				set({
					jwt,
					user: convertStrapiUser(strapiUser),
					isAuthenticated: true,
					isLoading: false,
					error: null,
					returnTo,
				});
			},

			refreshUser: async () => {
				const { jwt } = get();
				if (!jwt) {
					set({ user: null, isAuthenticated: false });
					return;
				}

				try {
					const strapiUser = await getCurrentUser(jwt);
					if (get().jwt !== jwt) return;
					if (!strapiUser) {
						await get().signOut();
						return;
					}
					set({ user: convertStrapiUser(strapiUser), isAuthenticated: true });
				} catch (error) {
					console.error('Failed to refresh user:', error);
				}
			},

			signOut: async () => {
				try {
					await Promise.all([secureStorage.removeItem('auth-storage'), clearPendingGoogleAuth()]);
				} catch (error) {
					console.error('Failed to clear stored authentication:', error);
				} finally {
					set({
						user: null,
						jwt: null,
						isAuthenticated: false,
						isLoading: false,
						error: null,
						returnTo: null,
					});
				}
			},

			clearError: () => set({ error: null }),
			setLoading: (loading: boolean) => set({ isLoading: loading }),
			setHydrated: (hydrated: boolean) => set({ hasHydrated: hydrated }),
		}),
		{
			name: 'auth-storage',
			storage: createJSONStorage(() => secureStorage),
			skipHydration: true,
			partialize: (state: AuthStore) => ({
				user: state.user,
				jwt: state.jwt,
				isAuthenticated: state.isAuthenticated,
			}),
			merge: (persisted, current) => {
				const stored = persisted as Partial<AuthState> | undefined;
				const jwt = typeof stored?.jwt === 'string' && stored.jwt ? stored.jwt : null;
				const storedUser = stored?.user;
				const user = isUser(storedUser) ? storedUser : null;
				return {
					...current,
					user,
					jwt,
					isAuthenticated: Boolean(jwt && user),
					hasHydrated: false,
				};
			},
		},
	),
);

setAuthExpiredHandler(() => {
	if (useAuthStore.getState().jwt) void useAuthStore.getState().signOut();
});

export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useJWT = () => useAuthStore((state) => state.jwt);
export const useAuthHydrated = () => useAuthStore((state) => state.hasHydrated);
