import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
	convertStrapiUser,
	getCurrentUser,
	signInWithGoogle as googleSignIn,
	type StrapiUser,
} from '@/lib/auth';
import { secureStorage } from '@/lib/storage';

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
	error: string | null;
}

interface AuthActions {
	signInWithGoogle: () => Promise<void>;
	signOut: () => Promise<void>;
	clearError: () => void;
	setLoading: (loading: boolean) => void;
	setAuth: (jwt: string, strapiUser: StrapiUser) => void;
	refreshUser: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
	persist(
		(set, get) => ({
			// State
			user: null,
			jwt: null,
			isLoading: false,
			isAuthenticated: false,
			error: null,

			// Actions
			signInWithGoogle: async () => {
				try {
					set({ isLoading: true, error: null });
					const result = await googleSignIn();

					if (result.type === 'success' && result.url) {
						// The URL is handled by the deep link listener in _layout.tsx
						// setAuth will be called which sets isLoading to false
					} else {
						set({ isLoading: false });
					}
				} catch (error) {
					console.error('Failed to initiate Google sign-in:', error);
					set({
						error: 'Failed to start Google sign-in. Please try again.',
						isLoading: false,
					});
				}
			},

			setAuth: (jwt: string, strapiUser: StrapiUser) => {
				const convertedUser = convertStrapiUser(strapiUser);
				set({
					jwt,
					user: convertedUser,
					isAuthenticated: true,
					isLoading: false,
					error: null,
				});
			},

			refreshUser: async () => {
				const { jwt, signOut } = get();

				if (!jwt) {
					set({ user: null, isAuthenticated: false });
					return;
				}

				try {
					const strapiUser = await getCurrentUser(jwt);

					if (!strapiUser) {
						signOut();
						return;
					}

					const convertedUser = convertStrapiUser(strapiUser);
					set({ user: convertedUser, isAuthenticated: true });
				} catch (error) {
					console.error('Failed to refresh user:', error);
				}
			},

			signOut: async () => {
				set({
					user: null,
					jwt: null,
					isAuthenticated: false,
					isLoading: false,
					error: null,
				});
			},

			clearError: () => set({ error: null }),
			setLoading: (loading: boolean) => set({ isLoading: loading }),
		}),
		{
			name: 'auth-storage',
			storage: createJSONStorage(() => secureStorage),
			partialize: (state: AuthStore) => ({
				user: state.user,
				jwt: state.jwt,
				isAuthenticated: state.isAuthenticated,
			}),
		},
	),
);

export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
export const useAuthError = () => useAuthStore((state) => state.error);
export const useJWT = () => useAuthStore((state) => state.jwt);
