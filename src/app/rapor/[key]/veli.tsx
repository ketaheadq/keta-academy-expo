import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { RaporHazir } from '@/components/features/deneme/rapor-hazir';
import { VeliForm } from '@/components/features/deneme/veli-form';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { useAsync } from '@/hooks/use-async';
import { getRaporOzeti, raporPdfUrl } from '@/lib/deneme';
import { openExternalUrl } from '@/lib/routes';
import { useThemeColors } from '@/lib/theme';

export default function VeliPage() {
	const { key } = useLocalSearchParams<{ key: string }>();
	const router = useRouter();
	const colors = useThemeColors();
	const { data: rapor, loading, error, reload } = useAsync(() => getRaporOzeti(key), [key]);
	const [sent, setSent] = useState(false);

	if (loading) {
		return (
			<>
				<Stack.Screen options={{ title: 'Raporu velinle paylaş' }} />
				<LoadingState />
			</>
		);
	}

	if (error) {
		return (
			<>
				<Stack.Screen options={{ title: 'Rapor yüklenemedi' }} />
				<ErrorState message={error} onRetry={reload} />
			</>
		);
	}

	if (!rapor) {
		return (
			<>
				<Stack.Screen options={{ title: 'Rapor bulunamadı' }} />
				<View className="flex-1 items-center justify-center bg-background">
					<EmptyState
						title="Rapor bulunamadı"
						description="Linki rapordaki haliyle açtığınızdan emin olun."
						actionLabel="Deneme sınavlarına git"
						onAction={() => router.replace('/deneme-sinavlari')}
					/>
				</View>
			</>
		);
	}

	return (
		<>
			<Stack.Screen options={{ title: 'Raporu velinle paylaş' }} />
			<ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 16, gap: 20 }}>
				<View>
					<Text className="font-medium text-primary text-sm">{rapor.denemeBaslik}</Text>
					<Text className="mt-1 font-bold text-2xl text-foreground">Raporu velinle paylaş</Text>
					<Text className="mt-2 text-base text-muted-foreground leading-relaxed">
						Velinin numarasını yaz; Çağlar Hoca velini arayıp raporu 15 dakikada ücretsiz birlikte
						değerlendirsin.
					</Text>
				</View>

				{sent ? (
					<View className="rounded-2xl border border-success/30 bg-success/10 p-5">
						<CheckCircle2 size={28} color={colors.success} />
						<Text className="mt-2 text-foreground">
							Teşekkürler. Çağlar Hoca velini arayıp raporu birlikte değerlendirecek. Raporu veline
							şimdi de gönderebilirsin:
						</Text>
						<RaporHazir raporKey={key} denemeBaslik={rapor.denemeBaslik} />
					</View>
				) : (
					<VeliForm raporAnahtari={key} kaynak="mobil-uygulama" onSuccess={() => setSent(true)} />
				)}

				{rapor.hazir ? (
					<Pressable
						onPress={() => openExternalUrl(raporPdfUrl(key))}
						className="items-center active:opacity-70"
					>
						<Text className="text-muted-foreground text-sm underline">Raporu tekrar aç (PDF)</Text>
					</Pressable>
				) : null}
			</ScrollView>
		</>
	);
}
