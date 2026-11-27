import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Check, GraduationCap, HelpCircle, Sparkles, Trophy, Users } from 'lucide-react-native';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { appHref, safeAppReturnPath, withAppReturn } from '@/lib/routes';
import { useAuthError, useAuthLoading, useAuthStore } from '@/stores/auth-store';

const FEATURES = [
	{
		icon: GraduationCap,
		title: '1000+ Kursa Erişim',
		description: 'YKS, AYT, LGS, KPSS, DGS ve daha fazlası için hazırlanmış kurslar',
	},
	{
		icon: Trophy,
		title: 'İlerlemenizi Takip Edin',
		description: 'Başarılar kazanın ve sertifikalar alın',
	},
	{
		icon: HelpCircle,
		title: 'Etkileşimli Quizler',
		description: 'Bilginizi ilgi çekici değerlendirmelerle test edin',
	},
	{
		icon: Users,
		title: 'Topluluk Oluşturun',
		description: 'Diğer öğrencilerle birlikte öğrenme deneyimi yaşayın',
	},
];

const BENEFITS = [
	'Tüm kurslara ücretsiz erişim',
	'İlerleme takibi',
	'Topluluk desteği ve etkileşim',
];

export default function SignUpScreen() {
	const router = useRouter();
	const { returnTo: requestedReturnTo } = useLocalSearchParams<{ returnTo?: string }>();
	const returnTo = safeAppReturnPath(requestedReturnTo);
	const isLoading = useAuthLoading();
	const error = useAuthError();
	const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle);

	const handleGoogleSignIn = async () => {
		if (await signInWithGoogle(returnTo)) {
			router.replace(appHref(useAuthStore.getState().returnTo ?? returnTo ?? '/'));
		}
	};

	return (
		<View className="flex-1 bg-white">
			<Stack.Screen options={{ title: 'Kayıt Ol' }} />
			<ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
				<View className="items-center py-6">
					<View className="mb-4 flex-row items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2">
						<Sparkles size={14} color="#2563eb" />
						<Text className="font-bold text-blue-700 text-xs">Yeni</Text>
						<Text className="text-blue-700 text-xs">Eğitim yolculuğunuzun ilk adımı</Text>
					</View>
					<Text className="text-center font-bold text-3xl text-slate-900 leading-tight">
						Öğrenme Yolculuğunuza Bugün Başlayın
					</Text>
					<Text className="mt-3 text-center text-base text-slate-600 leading-relaxed">
						Kaliteli eğitim içeriklerine erişim sağlayın, ilerlemenizi takip edin ve akademik
						hedeflerinize ulaşın.
					</Text>
				</View>

				<View className="flex-row flex-wrap gap-3">
					{FEATURES.map((feature) => (
						<View
							key={feature.title}
							className="rounded-2xl border border-slate-200 bg-white p-4"
							style={{ flexGrow: 1, flexBasis: '45%' }}
						>
							<View className="mb-3 size-10 items-center justify-center rounded-xl bg-blue-50">
								<feature.icon size={20} color="#2563eb" />
							</View>
							<Text className="font-bold text-slate-900 text-sm">{feature.title}</Text>
							<Text className="mt-1 text-slate-500 text-xs leading-5">{feature.description}</Text>
						</View>
					))}
				</View>

				<View className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
					<Text className="text-center font-bold text-slate-900 text-xl">Hesabınızı Oluşturun</Text>
					<Text className="mt-1 mb-5 text-center text-slate-500 text-sm">
						KetaLearn'e katılın ve potansiyelinizi açığa çıkarın
					</Text>

					{error ? (
						<View className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3">
							<Text className="text-red-700 text-sm">{error}</Text>
						</View>
					) : null}

					<Pressable
						onPress={handleGoogleSignIn}
						disabled={isLoading}
						className="flex-row items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 active:bg-blue-700"
					>
						{isLoading ? (
							<>
								<ActivityIndicator size="small" color="#ffffff" />
								<Text className="font-bold text-sm text-white">Hesap oluşturuluyor...</Text>
							</>
						) : (
							<Text className="font-bold text-sm text-white">Google ile Kayıt Ol</Text>
						)}
					</Pressable>

					<View className="mt-5 border-slate-100 border-t pt-4">
						<Text className="mb-3 font-semibold text-slate-900 text-sm">
							Neler elde edeceksiniz:
						</Text>
						<View className="gap-2">
							{BENEFITS.map((benefit) => (
								<View key={benefit} className="flex-row items-center gap-2">
									<Check size={16} color="#16a34a" />
									<Text className="flex-1 text-slate-600 text-sm">{benefit}</Text>
								</View>
							))}
						</View>
					</View>

					<View className="mt-5 border-slate-200 border-t pt-4">
						<Text className="text-center text-slate-600 text-sm">
							Zaten hesabınız var mı?{' '}
							<Link href={withAppReturn('/giris', returnTo)}>
								<Text className="font-medium text-blue-600">Buradan giriş yapın</Text>
							</Link>
						</Text>
					</View>
				</View>

				<Text className="mt-6 text-center text-slate-500 text-xs">
					Hesap oluşturarak{' '}
					<Link href="/hizmet-sartlari">
						<Text className="text-blue-600">Hizmet Şartlarımızı</Text>
					</Link>{' '}
					ve{' '}
					<Link href="/gizlilik-politikasi">
						<Text className="text-blue-600">Gizlilik Politikamızı</Text>
					</Link>{' '}
					kabul etmiş olursunuz
				</Text>
			</ScrollView>
		</View>
	);
}
