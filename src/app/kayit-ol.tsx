import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Check, GraduationCap, HelpCircle, Sparkles, Trophy, Users } from 'lucide-react-native';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { appHref, safeAppReturnPath, withAppReturn } from '@/lib/routes';
import { useThemeColors } from '@/lib/theme';
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
	const colors = useThemeColors();

	const handleGoogleSignIn = async () => {
		if (await signInWithGoogle(returnTo)) {
			router.replace(appHref(useAuthStore.getState().returnTo ?? returnTo ?? '/'));
		}
	};

	return (
		<View className="flex-1 bg-background">
			<Stack.Screen options={{ title: 'Kayıt Ol' }} />
			<ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
				<View className="items-center py-6">
					<View className="mb-4 flex-row items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2">
						<Sparkles size={14} color={colors.accent} />
						<Text className="font-bold text-accent text-xs">Yeni</Text>
						<Text className="text-accent text-xs">Eğitim yolculuğunuzun ilk adımı</Text>
					</View>
					<Text className="text-center font-bold text-3xl text-foreground leading-tight">
						Öğrenme Yolculuğunuza Bugün Başlayın
					</Text>
					<Text className="mt-3 text-center text-base text-muted-foreground leading-relaxed">
						Kaliteli eğitim içeriklerine erişim sağlayın, ilerlemenizi takip edin ve akademik
						hedeflerinize ulaşın.
					</Text>
				</View>

				<View className="flex-row flex-wrap gap-3">
					{FEATURES.map((feature) => (
						<View
							key={feature.title}
							className="rounded-2xl border border-border bg-card p-4"
							style={{ flexGrow: 1, flexBasis: '45%' }}
						>
							<View className="mb-3 size-10 items-center justify-center rounded-xl bg-primary/10">
								<feature.icon size={20} color={colors.primary} />
							</View>
							<Text className="font-bold text-foreground text-sm">{feature.title}</Text>
							<Text className="mt-1 text-muted-foreground text-xs leading-5">
								{feature.description}
							</Text>
						</View>
					))}
				</View>

				<View className="mt-6 rounded-2xl border border-border bg-card p-5">
					<Text className="text-center font-bold text-foreground text-xl">
						Hesabınızı Oluşturun
					</Text>
					<Text className="mt-1 mb-5 text-center text-muted-foreground text-sm">
						KetaLearn'e katılın ve potansiyelinizi açığa çıkarın
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
									Hesap oluşturuluyor...
								</Text>
							</>
						) : (
							<Text className="font-bold text-primary-foreground text-sm">Google ile Kayıt Ol</Text>
						)}
					</Pressable>

					<View className="mt-5 border-border border-t pt-4">
						<Text className="mb-3 font-semibold text-foreground text-sm">
							Neler elde edeceksiniz:
						</Text>
						<View className="gap-2">
							{BENEFITS.map((benefit) => (
								<View key={benefit} className="flex-row items-center gap-2">
									<Check size={16} color={colors.success} />
									<Text className="flex-1 text-muted-foreground text-sm">{benefit}</Text>
								</View>
							))}
						</View>
					</View>

					<View className="mt-5 border-border border-t pt-4">
						<Text className="text-center text-muted-foreground text-sm">
							Zaten hesabınız var mı?{' '}
							<Link href={withAppReturn('/giris', returnTo)}>
								<Text className="font-medium text-primary">Buradan giriş yapın</Text>
							</Link>
						</Text>
					</View>
				</View>

				<Text className="mt-6 text-center text-muted-foreground text-xs">
					Hesap oluşturarak{' '}
					<Link href="/hizmet-sartlari">
						<Text className="text-primary">Hizmet Şartlarımızı</Text>
					</Link>{' '}
					ve{' '}
					<Link href="/gizlilik-politikasi">
						<Text className="text-primary">Gizlilik Politikamızı</Text>
					</Link>{' '}
					kabul etmiş olursunuz
				</Text>
			</ScrollView>
		</View>
	);
}
