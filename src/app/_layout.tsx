import '@/global.css';

import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import * as Linking from 'expo-linking';
import { SplashScreen, Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useUniwind } from 'uniwind';
import { NAV_THEME } from '@/lib/theme';
import { useAuthStore } from '@/stores/auth-store';

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
	const { setAuth, refreshUser } = useAuthStore();
	const router = useRouter();
	const { theme } = useUniwind();

	useEffect(() => {
		void refreshUser();
		void SplashScreen.hideAsync();
	}, [refreshUser]);

	useEffect(() => {
		const handleDeepLink = ({ url }: { url: string }) => {
			const { path, queryParams } = Linking.parse(url);
			const jwt = queryParams?.jwt;
			const user = queryParams?.user;
			if (path === 'auth-callback' && typeof jwt === 'string' && typeof user === 'string') {
				setAuth(jwt, JSON.parse(decodeURIComponent(user)));
				router.replace('/');
			}
		};

		const subscription = Linking.addEventListener('url', handleDeepLink);
		void Linking.getInitialURL().then((url) => {
			if (url) handleDeepLink({ url });
		});
		return () => subscription.remove();
	}, [router, setAuth]);

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
