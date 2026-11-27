import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { CheckCircle2 } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { RaporHazir } from '@/components/features/deneme/rapor-hazir';
import { VeliForm } from '@/components/features/deneme/veli-form';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { useAsync } from '@/hooks/use-async';
import { getRaporOzeti, raporPdfUrl } from '@/lib/deneme';

export default function VeliPage() {
	const { key } = useLocalSearchParams<{ key: string }>();
	const router = useRouter();
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
				<View className="flex-1 items-center justify-center bg-slate-50">
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
			<ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, gap: 20 }}>
				<View>
					<Text className="font-medium text-blue-600 text-sm">{rapor.denemeBaslik}</Text>
					<Text className="mt-1 font-bold text-2xl text-slate-900">Raporu velinle paylaş</Text>
					<Text className="mt-2 text-base text-slate-500 leading-relaxed">
						Velinin numarasını yaz; Çağlar Hoca velini arayıp raporu 15 dakikada ücretsiz birlikte
						değerlendirsin.
					</Text>
				</View>

				{sent ? (
					<View className="rounded-2xl border border-green-200 bg-green-50 p-5">
						<CheckCircle2 size={28} color="#15803d" />
						<Text className="mt-2 text-slate-900">
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
						onPress={() => void Linking.openURL(raporPdfUrl(key))}
						className="items-center active:opacity-70"
					>
						<Text className="text-slate-500 text-sm underline">Raporu tekrar aç (PDF)</Text>
					</Pressable>
				) : null}
			</ScrollView>
		</>
	);
}
