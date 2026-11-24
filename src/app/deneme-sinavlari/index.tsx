import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { DenemeCard } from '@/components/features/deneme/deneme-card';
import { EmptyState, LoadingState } from '@/components/shared/states';
import { useAsync } from '@/hooks/use-async';
import { type DenemeSummary, getDenemeler, SINAV_TURU_LABEL } from '@/lib/deneme';
import { cn } from '@/lib/utils';

type Filter =
	| { kind: 'all' }
	| { kind: 'tur'; value: DenemeSummary['sinavTuru'] }
	| { kind: 'sinif'; value: string };

export default function DenemeSinavlariScreen() {
	const router = useRouter();
	const { data, loading } = useAsync(getDenemeler);
	const [filter, setFilter] = useState<Filter>({ kind: 'all' });

	const denemeler = data ?? [];

	// Exam types first, then the grades used by school exams; only options that have exams.
	const types = [...new Set(denemeler.map((deneme) => deneme.sinavTuru))].filter(
		(tur) => tur !== 'Okul',
	);
	const grades: { slug: string; title: string }[] = [];
	for (const deneme of denemeler) {
		const sinif = deneme.sinif;
		if (deneme.sinavTuru !== 'Okul' || !sinif) continue;
		if (!grades.some((grade) => grade.slug === sinif.slug)) grades.push(sinif);
	}

	const options: { label: string; filter: Filter }[] = [
		{ label: 'Tümü', filter: { kind: 'all' } },
		...types.map((tur) => ({
			label: SINAV_TURU_LABEL[tur],
			filter: { kind: 'tur', value: tur } as Filter,
		})),
		...grades.map((grade) => ({
			label: grade.title,
			filter: { kind: 'sinif', value: grade.slug } as Filter,
		})),
	];

	const isActive = (candidate: Filter) => JSON.stringify(candidate) === JSON.stringify(filter);

	const visible = denemeler.filter((deneme) =>
		filter.kind === 'all'
			? true
			: filter.kind === 'tur'
				? deneme.sinavTuru === filter.value
				: deneme.sinavTuru === 'Okul' && deneme.sinif?.slug === filter.value,
	);

	return (
		<>
			<Stack.Screen options={{ title: 'Deneme Sınavları' }} />
			{loading ? (
				<LoadingState />
			) : denemeler.length === 0 ? (
				<View className="flex-1 items-center justify-center bg-slate-50">
					<EmptyState title="Henüz deneme sınavı yok" />
				</View>
			) : (
				<ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, gap: 16 }}>
					<View>
						<Text className="font-extrabold text-2xl text-slate-900">
							Ücretsiz Deneme Sınavları
						</Text>
						<Text className="mt-2 text-base text-slate-500 leading-relaxed">
							Kayıt olmadan çöz, netini hemen gör. Hangi konularda eksik olduğunu gösteren detaylı
							raporu telefonuna gönderelim.
						</Text>
					</View>

					{options.length > 2 ? (
						<View className="flex-row flex-wrap gap-2">
							{options.map((option) => {
								const active = isActive(option.filter);
								return (
									<Pressable
										key={option.label}
										onPress={() => setFilter(option.filter)}
										className={cn(
											'rounded-full px-4 py-2',
											active ? 'bg-blue-600' : 'bg-slate-200 active:bg-slate-300',
										)}
									>
										<Text
											className={cn(
												'font-medium text-sm',
												active ? 'text-white' : 'text-slate-600',
											)}
										>
											{option.label}
										</Text>
									</Pressable>
								);
							})}
						</View>
					) : null}

					{visible.length ? (
						<View className="gap-4">
							{visible.map((deneme) => (
								<DenemeCard
									key={deneme.documentId}
									deneme={deneme}
									onPress={() => router.push(`/deneme-sinavlari/${deneme.slug}`)}
								/>
							))}
						</View>
					) : (
						<View className="rounded-xl border border-slate-200 bg-white p-8">
							<Text className="text-center text-slate-500 text-sm">
								Bu filtrede henüz deneme yok. Yakında eklenecek.
							</Text>
						</View>
					)}
				</ScrollView>
			)}
		</>
	);
}
