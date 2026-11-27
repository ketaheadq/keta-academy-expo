import '@/global.css';

import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import * as Linking from 'expo-linking';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { Uniwind, useUniwind } from 'uniwind';
import { AnimatedSplash } from '@/components/shared/animated-splash';
import { completeGoogleSignIn } from '@/lib/auth';
import { appHref } from '@/lib/routes';
import { NAV_THEME, useThemeColors } from '@/lib/theme';
import { useAuthHydrated, useAuthStore } from '@/stores/auth-store';
import { useThemeStore } from '@/stores/theme-store';

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
	// Ensure that reloading on `/modal` keeps a back button present.
	initialRouteName: '(tabs)',
};

void SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
	const { setAuth, setHydrated, refreshUser } = useAuthStore();
	const hasHydrated = useAuthHydrated();
	const router = useRouter();
	const { theme } = useUniwind();
	const colors = useThemeColors();
	const preference = useThemeStore((state) => state.preference);
	const themeHydrated = useThemeStore((state) => state.hasHydrated);
	const setThemeHydrated = useThemeStore((state) => state.setHydrated);
	const [showSplash, setShowSplash] = useState(true);
	const finishSplash = useCallback(() => setShowSplash(false), []);
	const ready = hasHydrated && themeHydrated;

	useEffect(() => {
		Uniwind.setTheme(preference);
	}, [preference]);

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
				await useThemeStore.persist.rehydrate();
			} catch (error) {
				console.error('Failed to restore theme preference:', error);
			} finally {
				if (active) setThemeHydrated(true);
			}

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
		};

		void initialize();
		return () => {
			active = false;
			subscription?.remove();
		};
	}, [refreshUser, router, setAuth, setHydrated, setThemeHydrated]);

	useEffect(() => {
		if (!ready) return;
		void SplashScreen.hideAsync().catch(() => {});
	}, [ready]);

	return (
		<ThemeProvider value={NAV_THEME[theme ?? 'light']}>
			<StatusBar style={showSplash || theme === 'dark' ? 'light' : 'dark'} />
			{ready ? (
				<View
					style={{ flex: 1 }}
					accessibilityElementsHidden={showSplash}
					importantForAccessibility={showSplash ? 'no-hide-descendants' : 'auto'}
					aria-hidden={showSplash}
				>
					<Stack
						screenOptions={{
							headerStyle: {
								backgroundColor: colors.card,
							},
							headerShadowVisible: false,
							headerTitleStyle: {
								fontWeight: 'bold',
								color: colors.foreground,
							},
							headerTintColor: colors.primary,
							contentStyle: { backgroundColor: colors.background },
						}}
					>
						<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
						<Stack.Screen name="modal" options={{ presentation: 'modal' }} />
					</Stack>
				</View>
			) : null}
			<PortalHost />
			{showSplash ? <AnimatedSplash ready={ready} onFinish={finishSplash} /> : null}
		</ThemeProvider>
	);
}
