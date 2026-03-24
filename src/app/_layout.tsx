import '@/global.css';

import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useUniwind } from 'uniwind';
import { NAV_THEME } from '@/lib/theme';

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

export default function RootLayout() {
const { setAuth, refreshUser } = useAuthStore();
const router = useRouter();

useEffect(() => {
  // Initial user refresh if JWT exists
  refreshUser();
  SplashScreen.hideAsync();
}, [refreshUser]);

useEffect(() => {
  const handleDeepLink = (event: { url: string }) => {
    const { path, queryParams } = Linking.parse(event.url);

    if (path === 'auth-callback' && queryParams?.jwt) {
      // Handle successful auth from mobile redirect
      const jwt = queryParams.jwt as string;
      const user = queryParams.user
        ? JSON.parse(decodeURIComponent(queryParams.user as string))
        : null;

      if (jwt && user) {
        setAuth(jwt, user);
        router.replace('/');
      }
    }
  };

  const subscription = Linking.addEventListener('url', handleDeepLink);

  // Also check for initial URL
  Linking.getInitialURL().then((url) => {
    if (url) handleDeepLink({ url });
  });

  return () => {
    subscription.remove();
  };
}, [setAuth, router]);

return <RootLayoutNav />;
}

export default function RootLayout() {
	const { theme } = useUniwind();

	return (
		<ThemeProvider value={NAV_THEME[theme ?? 'light']}>
			<StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
			<Stack>
				<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
				<Stack.Screen name="modal" options={{ presentation: 'modal' }} />
			</Stack>
			<PortalHost />
		</ThemeProvider>
	);
}
