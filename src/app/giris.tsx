import { Link, Stack } from 'expo-router';
import { BookOpen, GraduationCap, Shield, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import type { StrapiAuthResponse } from '@/lib/auth';
import { STRAPI_URL } from '@/lib/strapi';
import {
	useAuthError,
	useAuthLoading,
	useAuthStore,
	useIsAuthenticated,
	useUser,
} from '@/stores/auth-store';

const DEMO_LOGIN_ENABLED = process.env.EXPO_PUBLIC_KETA_DEMO_LOGIN === 'true';

export default function SignInScreen() {
	const user = useUser();
	const isAuthenticated = useIsAuthenticated();
	const isLoading = useAuthLoading();
	const error = useAuthError();
	const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);
	const signOut = useAuthStore((state) => state.signOut);
	const setAuth = useAuthStore((state) => state.setAuth);
	const clearError = useAuthStore((state) => state.clearError);

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
			setAuth(jwt, strapiUser);
		} catch {
			setDemoError(true);
		} finally {
			setDemoLoading(false);
		}
	};

	return (
		<View className="flex-1 bg-white">
			<Stack.Screen options={{ title: 'Giriş Yap' }} />
			<ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
				{isAuthenticated ? (
					<View className="flex-1 items-center gap-4 py-16">
						<View className="size-16 items-center justify-center rounded-full bg-blue-600">
							<GraduationCap size={32} color="#ffffff" />
						</View>
						<Text className="text-center font-bold text-2xl text-slate-900">
							{user?.name ?? 'KetaLearn'}
						</Text>
						{user?.email ? (
							<Text className="text-center text-slate-500 text-sm">{user.email}</Text>
						) : null}
						<Pressable
							onPress={() => void signOut()}
							className="mt-4 rounded-full border border-slate-300 px-8 py-3 active:bg-slate-50"
						>
							<Text className="font-bold text-slate-700 text-sm">Çıkış Yap</Text>
						</Pressable>
					</View>
				) : (
					<>
						<View className="items-center py-6">
							<View className="mb-5 size-16 items-center justify-center rounded-full bg-blue-600">
								<GraduationCap size={32} color="#ffffff" />
							</View>
							<Text className="font-bold text-3xl text-slate-900">Tekrar Hoşgeldiniz!</Text>
							<Text className="mt-2 text-center text-slate-600">
								Öğrenme yolculuğunuza devam etmek için giriş yapın
							</Text>
						</View>

						<View className="rounded-2xl border border-slate-200 bg-white p-5">
							<Text className="text-center font-bold text-slate-900 text-xl">
								KetaLearn'e Giriş
							</Text>
							<Text className="mt-1 mb-5 text-center text-slate-500 text-sm">
								Kurslarınıza erişin, ilerlemenizi takip edin ve öğrenmeye devam edin
							</Text>

							{error ? (
								<View className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">
									<Text className="text-red-700 text-sm">{error}</Text>
								</View>
							) : null}

							<Pressable
								onPress={() => void signInWithGoogle()}
								disabled={isLoading}
								className="flex-row items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 active:bg-blue-700"
							>
								{isLoading ? (
									<>
										<ActivityIndicator size="small" color="#ffffff" />
										<Text className="font-bold text-sm text-white">Giriş yapılıyor...</Text>
									</>
								) : (
									<Text className="font-bold text-sm text-white">Google ile Devam Et</Text>
								)}
							</Pressable>

							{DEMO_LOGIN_ENABLED ? (
								<View className="mt-3">
									<Pressable
										onPress={handleDemoSignIn}
										disabled={demoLoading || isLoading}
										className="items-center rounded-xl border border-slate-300 py-3.5 active:bg-slate-50"
									>
										<Text className="font-bold text-slate-700 text-sm">
											{demoLoading ? 'Giriş yapılıyor...' : 'Demo öğrenciyle giriş yap'}
										</Text>
									</Pressable>
									{demoError ? (
										<Text className="mt-2 text-center text-red-600 text-sm">
											Demo öğrenciyle giriş yapılamadı.
										</Text>
									) : null}
								</View>
							) : null}

							<View className="my-5 flex-row items-center gap-2">
								<View className="h-px flex-1 bg-slate-200" />
								<Text className="text-slate-500 text-sm">Neden Google Girişi?</Text>
								<View className="h-px flex-1 bg-slate-200" />
							</View>

							<View className="gap-3">
								<View className="flex-row items-center gap-3">
									<Shield size={16} color="#2563eb" />
									<Text className="flex-1 text-slate-600 text-sm">
										Güvenli ve şifrelenmiş kimlik doğrulama
									</Text>
								</View>
								<View className="flex-row items-center gap-3">
									<Users size={16} color="#2563eb" />
									<Text className="flex-1 text-slate-600 text-sm">
										Şifre hatırlamadan hızlı erişim
									</Text>
								</View>
								<View className="flex-row items-center gap-3">
									<BookOpen size={16} color="#2563eb" />
									<Text className="flex-1 text-slate-600 text-sm">
										İlerlemenizi tüm cihazlarda senkronize edin
									</Text>
								</View>
							</View>

							<View className="mt-5 border-slate-200 border-t pt-4">
								<Text className="text-center text-slate-600 text-sm">
									Hesabınız yok mu?{' '}
									<Link href="/kayit-ol">
										<Text className="font-medium text-blue-600">Buradan kayıt olun</Text>
									</Link>
								</Text>
							</View>
						</View>

						<Text className="mt-6 text-center text-slate-500 text-xs">
							Giriş yaparak{' '}
							<Link href="/hizmet-sartlari">
								<Text className="text-blue-600">Hizmet Şartlarımızı</Text>
							</Link>{' '}
							ve{' '}
							<Link href="/gizlilik-politikasi">
								<Text className="text-blue-600">Gizlilik Politikamızı</Text>
							</Link>{' '}
							kabul etmiş olursunuz
						</Text>
					</>
				)}
			</ScrollView>
		</View>
	);
}
