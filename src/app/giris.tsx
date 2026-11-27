import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { BookOpen, GraduationCap, Shield, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import type { StrapiAuthResponse } from '@/lib/auth';
import { appHref, safeAppReturnPath, withAppReturn } from '@/lib/routes';
import { STRAPI_URL } from '@/lib/strapi';
import { useThemeColors } from '@/lib/theme';
import {
	useAuthError,
	useAuthLoading,
	useAuthStore,
	useIsAuthenticated,
	useUser,
} from '@/stores/auth-store';

const DEMO_LOGIN_ENABLED = process.env.EXPO_PUBLIC_KETA_DEMO_LOGIN === 'true';

export default function SignInScreen() {
	const router = useRouter();
	const { returnTo: requestedReturnTo } = useLocalSearchParams<{ returnTo?: string }>();
	const returnTo = safeAppReturnPath(requestedReturnTo);
	const user = useUser();
	const isAuthenticated = useIsAuthenticated();
	const isLoading = useAuthLoading();
	const error = useAuthError();
	const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
	const signOut = useAuthStore((state) => state.signOut);
	const setAuth = useAuthStore((state) => state.setAuth);
	const clearError = useAuthStore((state) => state.clearError);
	const colors = useThemeColors();

	const [demoLoading, setDemoLoading] = useState(false);
	const [demoError, setDemoError] = useState(false);

	useEffect(() => {
		clearError();
	}, [clearError]);

	const handleDemoSignIn = async () => {
		setDemoLoading(true);
		setDemoError(false);
		try {
			const response = await fetch(`${STRAPI_URL}/api/auth/local`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					identifier: 'demo-learner@ketalearn.test',
					password: 'KetaDemo!2026',
				}),
			});
			if (!response.ok) throw new Error('Demo login failed');
			const { jwt, user: strapiUser } = (await response.json()) as StrapiAuthResponse;
			setAuth(jwt, strapiUser, returnTo);
			router.replace(appHref(returnTo ?? '/'));
		} catch {
			setDemoError(true);
		} finally {
			setDemoLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		if (await signInWithGoogle(returnTo)) {
			router.replace(appHref(useAuthStore.getState().returnTo ?? returnTo ?? '/'));
		}
	};

	return (
		<View className="flex-1 bg-background">
			<Stack.Screen options={{ title: 'Giriş Yap' }} />
			<ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
				{isAuthenticated ? (
					<View className="flex-1 items-center gap-4 py-16">
						<View className="size-16 items-center justify-center rounded-full bg-primary">
							<GraduationCap size={32} color={colors.primaryForeground} />
						</View>
						<Text className="text-center font-bold text-2xl text-foreground">
							{user?.name ?? 'KetaLearn'}
						</Text>
						{user?.email ? (
							<Text className="text-center text-muted-foreground text-sm">{user.email}</Text>
						) : null}
						<Pressable
							onPress={() => void signOut()}
							className="mt-4 rounded-full border border-input bg-card px-8 py-3 active:bg-muted"
						>
							<Text className="font-bold text-secondary-foreground text-sm">Çıkış Yap</Text>
						</Pressable>
					</View>
				) : (
					<>
						<View className="items-center py-6">
							<View className="mb-5 size-16 items-center justify-center rounded-full bg-primary">
								<GraduationCap size={32} color={colors.primaryForeground} />
							</View>
							<Text className="font-bold text-3xl text-foreground">Tekrar Hoşgeldiniz!</Text>
							<Text className="mt-2 text-center text-muted-foreground">
								Öğrenme yolculuğunuza devam etmek için giriş yapın
							</Text>
						</View>

						<View className="rounded-2xl border border-border bg-card p-5">
							<Text className="text-center font-bold text-foreground text-xl">
								KetaLearn'e Giriş
							</Text>
							<Text className="mt-1 mb-5 text-center text-muted-foreground text-sm">
								Kurslarınıza erişin, ilerlemenizi takip edin ve öğrenmeye devam edin
							</Text>

							{error ? (
								<View className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3">
									<Text className="text-destructive text-sm">{error}</Text>
								</View>
							) : null}

							<Pressable
								onPress={handleGoogleSignIn}
								disabled={isLoading}
								className="flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 active:bg-primary/90"
							>
								{isLoading ? (
									<>
										<ActivityIndicator size="small" color={colors.primaryForeground} />
										<Text className="font-bold text-primary-foreground text-sm">
											Giriş yapılıyor...
										</Text>
									</>
								) : (
									<Text className="font-bold text-primary-foreground text-sm">
										Google ile Devam Et
									</Text>
								)}
							</Pressable>

							{DEMO_LOGIN_ENABLED ? (
								<View className="mt-3">
									<Pressable
										onPress={handleDemoSignIn}
										disabled={demoLoading || isLoading}
										className="items-center rounded-xl border border-input bg-card py-3.5 active:bg-muted"
									>
										<Text className="font-bold text-secondary-foreground text-sm">
											{demoLoading ? 'Giriş yapılıyor...' : 'Demo öğrenciyle giriş yap'}
										</Text>
									</Pressable>
									{demoError ? (
										<Text className="mt-2 text-center text-destructive text-sm">
											Demo öğrenciyle giriş yapılamadı.
										</Text>
									) : null}
								</View>
							) : null}

							<View className="my-5 flex-row items-center gap-2">
								<View className="h-px flex-1 bg-border" />
								<Text className="text-muted-foreground text-sm">Neden Google Girişi?</Text>
								<View className="h-px flex-1 bg-border" />
							</View>

							<View className="gap-3">
								<View className="flex-row items-center gap-3">
									<Shield size={16} color={colors.primary} />
									<Text className="flex-1 text-muted-foreground text-sm">
										Güvenli ve şifrelenmiş kimlik doğrulama
									</Text>
								</View>
								<View className="flex-row items-center gap-3">
									<Users size={16} color={colors.primary} />
									<Text className="flex-1 text-muted-foreground text-sm">
										Şifre hatırlamadan hızlı erişim
									</Text>
								</View>
								<View className="flex-row items-center gap-3">
									<BookOpen size={16} color={colors.primary} />
									<Text className="flex-1 text-muted-foreground text-sm">
										İlerlemenizi tüm cihazlarda senkronize edin
									</Text>
								</View>
							</View>

							<View className="mt-5 border-border border-t pt-4">
								<Text className="text-center text-muted-foreground text-sm">
									Hesabınız yok mu?{' '}
									<Link href={withAppReturn('/kayit-ol', returnTo)}>
										<Text className="font-medium text-primary">Buradan kayıt olun</Text>
									</Link>
								</Text>
							</View>
						</View>

						<Text className="mt-6 text-center text-muted-foreground text-xs">
							Giriş yaparak{' '}
							<Link href="/hizmet-sartlari">
								<Text className="text-primary">Hizmet Şartlarımızı</Text>
							</Link>{' '}
							ve{' '}
							<Link href="/gizlilik-politikasi">
								<Text className="text-primary">Gizlilik Politikamızı</Text>
							</Link>{' '}
							kabul etmiş olursunuz
						</Text>
					</>
				)}
			</ScrollView>
		</View>
	);
}
