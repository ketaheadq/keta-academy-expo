import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { DenemeCard } from '@/components/features/deneme/deneme-card';
import { Reveal } from '@/components/shared/motion';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { useAsync } from '@/hooks/use-async';
import { type DenemeSummary, getDenemeler, SINAV_TURU_LABEL } from '@/lib/deneme';
import { cn } from '@/lib/utils';

type Filter =
	| { kind: 'all' }
	| { kind: 'tur'; value: DenemeSummary['sinavTuru'] }
	| { kind: 'sinif'; value: string };

export default function DenemeSinavlariScreen() {
	const router = useRouter();
	const { data, loading, error, reload } = useAsync(getDenemeler);
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
			) : error ? (
				<ErrorState message={error} onRetry={reload} />
			) : (
				<ScrollView
					className="flex-1 bg-background"
					contentContainerStyle={{ padding: 16, gap: 16 }}
				>
					<Reveal delay={20}>
						<View>
							<Text className="font-extrabold text-2xl text-foreground">
								Ücretsiz Deneme Sınavları
							</Text>
							<Text className="mt-2 text-base text-muted-foreground leading-relaxed">
								Kayıt olmadan çöz, netini hemen gör. Hangi konularda eksik olduğunu gösteren detaylı
								raporu telefonuna gönderelim.
							</Text>
						</View>
					</Reveal>

					{denemeler.length === 0 ? (
						<EmptyState title="Henüz deneme sınavı yok" />
					) : (
						<>
							{options.length > 2 ? (
								<View className="flex-row flex-wrap gap-2">
									{options.map((option) => {
										const active = isActive(option.filter);
										return (
											<Pressable
												key={option.label}
												onPress={() => setFilter(option.filter)}
												className={cn(
													'rounded-full border px-4 py-2',
													active
														? 'border-primary bg-primary'
														: 'border-input bg-secondary active:bg-accent',
												)}
											>
												<Text
													className={cn(
														'font-medium text-sm',
														active ? 'text-primary-foreground' : 'text-secondary-foreground',
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
								<View className="rounded-xl border border-border bg-card p-8">
									<Text className="text-center text-muted-foreground text-sm">
										Bu filtrede henüz deneme yok. Yakında eklenecek.
									</Text>
								</View>
							)}
						</>
					)}
				</ScrollView>
			)}
		</>
	);
}
