import { router, Stack, useLocalSearchParams } from 'expo-router';
import { BookOpen, User } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { TutorContactButtons } from '@/components/features/tutoring/tutor-contact-buttons';
import { TutorReviews } from '@/components/features/tutoring/tutor-reviews';
import { RatingStars } from '@/components/shared/rating-stars';
import { RichText } from '@/components/shared/rich-text';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { useAsync } from '@/hooks/use-async';
import {
	EMPTY_RATING,
	getContactPage,
	getTutoringProfile,
	getTutorRatingSummaries,
	mediaUrl,
} from '@/lib/strapi';
import { formatNumberTR } from '@/lib/utils';

function StatTile({ value, label }: { value: string; label: string }) {
	return (
		<View className="flex-1 items-center rounded-xl bg-blue-50 px-1 py-3">
			<Text className="font-bold text-blue-600 text-lg">{value}</Text>
			<Text className="text-center text-slate-500 text-xs">{label}</Text>
		</View>
	);
}

export default function TutorProfileScreen() {
	const { slug } = useLocalSearchParams<{ slug: string }>();

	const { data, loading, error, reload } = useAsync(async () => {
		const [tutor, summaries, contact] = await Promise.all([
			getTutoringProfile(slug),
			getTutorRatingSummaries(),
			getContactPage().catch(() => null),
		]);
		return { tutor, summaries, contactPhone: contact?.phone ?? null };
	}, [slug]);

	const tutor = data?.tutor ?? null;
	const summary = (tutor ? data?.summaries[tutor.documentId] : undefined) ?? EMPTY_RATING;
	const contactPhone = data?.contactPhone ?? null;
	const picture = mediaUrl(tutor?.profilePicture?.url);
	const expertise = (tutor?.experties ?? '')
		.split(',')
		.map((item) => item.trim())
		.filter(Boolean);

	let body: ReactNode;
	if (loading && !data) {
		body = <LoadingState />;
	} else if (error && !tutor) {
		body = <ErrorState message={error} onRetry={reload} />;
	} else if (!tutor) {
		body = (
			<EmptyState
				title="Öğretmen bulunamadı"
				actionLabel="Özel ders sayfasına dön"
				onAction={() => router.replace('/ozel-ders')}
			/>
		);
	} else {
		body = (
			<ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 16, gap: 16 }}>
				<View className="rounded-2xl border border-slate-200 bg-white p-5">
					<View className="flex-row items-center gap-4">
						{picture ? (
							<Image
								source={{ uri: picture }}
								className="size-24 rounded-full border-4 border-white bg-slate-100"
							/>
						) : (
							<View className="size-24 items-center justify-center rounded-full bg-slate-100">
								<User size={40} color="#64748b" />
							</View>
						)}
						<View className="min-w-0 flex-1">
							<Text className="font-bold text-2xl text-slate-900">{tutor.name}</Text>
							<Text className="mt-1 font-medium text-blue-600">{tutor.title}</Text>
						</View>
					</View>

					<View className="mt-4 flex-row flex-wrap items-center gap-2">
						{summary.count > 0 ? (
							<>
								<RatingStars rating={summary.average} size={18} />
								<Text className="font-semibold text-slate-900 text-sm">
									{formatNumberTR(summary.average)}
								</Text>
								<Text className="text-slate-500 text-sm">{summary.count} değerlendirme</Text>
							</>
						) : (
							<Text className="text-slate-500 text-sm">Henüz değerlendirme yok</Text>
						)}
					</View>

					{(tutor.subjects ?? []).length > 0 ? (
						<View className="mt-3 flex-row flex-wrap gap-2">
							{tutor.subjects.map((subject) => (
								<View key={subject.slug} className="rounded-full bg-blue-50 px-3 py-1">
									<Text className="font-medium text-blue-600 text-sm">{subject.title}</Text>
								</View>
							))}
						</View>
					) : null}

					<View className="mt-5 flex-row gap-2">
						<StatTile
							value={summary.satisfaction !== null ? `%${summary.satisfaction}` : '—'}
							label={summary.satisfaction !== null ? 'Memnuniyet' : 'Henüz oy yok'}
						/>
						<StatTile value={`${tutor.studentCount}`} label="Öğrenci" />
						<StatTile value={`${tutor.exprienceYears}`} label="Yıl deneyim" />
					</View>
				</View>

				<View className="rounded-2xl border border-slate-200 bg-white p-5">
					<View className="mb-4 flex-row items-center gap-2">
						<BookOpen size={20} color="#0f172a" />
						<Text className="font-bold text-slate-900 text-xl">Hakkında</Text>
					</View>
					{expertise.length > 0 ? (
						<View className="mb-4 flex-row flex-wrap gap-2">
							{expertise.map((item) => (
								<View
									key={item}
									className="rounded-full border border-slate-200 bg-white px-3 py-1"
								>
									<Text className="text-slate-600 text-sm">{item}</Text>
								</View>
							))}
						</View>
					) : null}
					<RichText blocks={tutor.content} />
				</View>

				<TutorReviews tutor={tutor} returnPath={`/ozel-ders/${encodeURIComponent(slug)}`} />

				<View className="rounded-2xl border border-slate-200 bg-white p-5">
					<Text className="font-bold text-3xl text-slate-900">
						₺{tutor.price}
						<Text className="font-normal text-base text-slate-500">/saat</Text>
					</Text>
					<Text className="mt-2 text-slate-600 text-sm leading-relaxed">
						Ücretsiz deneme dersi ve seviye tespiti için {tutor.name} ile doğrudan iletişime geçin.
					</Text>
					<View className="mt-4">
						{tutor.phone || contactPhone ? (
							<TutorContactButtons tutor={tutor} fallbackPhone={contactPhone} />
						) : (
							<Text className="text-slate-500 text-sm">İletişim bilgisi yakında eklenecek.</Text>
						)}
					</View>
				</View>
			</ScrollView>
		);
	}

	return (
		<View className="flex-1 bg-slate-50">
			<Stack.Screen options={{ title: tutor?.name ?? 'Özel Ders' }} />
			{body}
		</View>
	);
}
