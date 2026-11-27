import '@/global.css';

import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import * as Linking from 'expo-linking';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useUniwind } from 'uniwind';
import { completeGoogleSignIn } from '@/lib/auth';
import { appHref } from '@/lib/routes';
import { NAV_THEME } from '@/lib/theme';
import { useAuthHydrated, useAuthStore } from '@/stores/auth-store';

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
	// Ensure that reloading on `/modal` keeps a back button present.
	initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const HEADER_STYLE = {
	backgroundColor: '#ffffff',
	borderBottomWidth: 1,
	borderBottomColor: '#f1f5f9',
	elevation: 0,
	shadowOpacity: 0,
} as const;

const HEADER_TITLE_STYLE = {
	fontWeight: 'bold' as const,
	color: '#0f172a',
};

export default function RootLayout() {
	const { setAuth, setHydrated, refreshUser } = useAuthStore();
	const hasHydrated = useAuthHydrated();
	const router = useRouter();
	const { theme } = useUniwind();

	useEffect(() => {
		let active = true;
		let subscription: ReturnType<typeof Linking.addEventListener> | undefined;

		const handleDeepLink = async (url: string) => {
			const callback = await completeGoogleSignIn(url);
			if (!active || !callback) return;
			if ('error' in callback) {
				useAuthStore.setState({ error: callback.error, isLoading: false });
				router.replace('/giris');
				return;
			}
			setAuth(callback.jwt, callback.user, callback.returnTo);
			router.replace(appHref(callback.returnTo ?? '/'));
		};

		const initialize = async () => {
			try {
				await useAuthStore.persist.rehydrate();
			} catch (error) {
				console.error('Failed to restore authentication:', error);
			} finally {
				if (active) setHydrated(true);
			}
			if (!active) return;

			subscription = Linking.addEventListener('url', ({ url }) => {
				void handleDeepLink(url);
			});
			try {
				const initialUrl = await Linking.getInitialURL();
				if (initialUrl) await handleDeepLink(initialUrl);
			} catch (error) {
				console.error('Failed to handle initial link:', error);
			}
			if (!active) return;
			void refreshUser();
			void SplashScreen.hideAsync();
		};

		void initialize();
		return () => {
			active = false;
			subscription?.remove();
		};
	}, [refreshUser, router, setAuth, setHydrated]);

	if (!hasHydrated) return null;

	return (
		<ThemeProvider value={NAV_THEME[theme ?? 'light']}>
			<StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
			<Stack
				screenOptions={{
					headerStyle: HEADER_STYLE,
					headerTitleStyle: HEADER_TITLE_STYLE,
					headerTintColor: '#2563eb',
					contentStyle: { backgroundColor: '#f8fafc' },
				}}
			>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen name="modal" options={{ presentation: 'modal' }} />
			</Stack>
			<PortalHost />
		</ThemeProvider>
	);
}
