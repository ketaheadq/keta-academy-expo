import { Stack, useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { TutorCard } from '@/components/features/tutoring/tutor-card';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { useAsync } from '@/hooks/use-async';
import {
	EMPTY_RATING,
	getContactPage,
	getTutoringProfiles,
	getTutorRatingSummaries,
	type StrapiTutoringProfile,
	type TutorRatingSummary,
	tutorPath,
} from '@/lib/strapi';
import { cn, normalizeTurkish } from '@/lib/utils';

const SORT_OPTIONS = [
	{ id: 'rating', label: 'Puana Göre' },
	{ id: 'price', label: 'Fiyata Göre' },
	{ id: 'experience', label: 'Deneyime Göre' },
] as const;

type SortBy = (typeof SORT_OPTIONS)[number]['id'];

const STEPS = [
	{
		title: 'Öğretmeni Seç',
		description:
			'Öğretmen profillerini, verdiği dersleri ve öğrenci değerlendirmelerini inceleyin.',
	},
	{
		title: "WhatsApp'tan Yaz",
		description: "Öğretmene WhatsApp'tan yazın ya da arayın; hedefinizi ve uygun saatleri konuşun.",
	},
	{
		title: 'Deneme Dersiyle Başla',
		description: 'Ücretsiz deneme dersinde seviyenizi belirleyin, size özel programla devam edin.',
	},
];

// Stable identity so the memoised lists below don't recompute on every render while loading.
const NO_TUTORS: StrapiTutoringProfile[] = [];

export default function TutoringListScreen() {
	const router = useRouter();
	const scrollRef = useRef<ScrollView>(null);
	const tutorSectionY = useRef(0);
	const stepsSectionY = useRef(0);

	const [searchQuery, setSearchQuery] = useState('');
	const [selectedSubject, setSelectedSubject] = useState('all');
	const [sortBy, setSortBy] = useState<SortBy>('rating');

	const { data, loading, error, reload } = useAsync(async () => {
		const [tutors, ratings, contact] = await Promise.all([
			getTutoringProfiles(),
			getTutorRatingSummaries(),
			getContactPage().catch(() => null),
		]);
		return { tutors, ratings, fallbackPhone: contact?.phone || '05451304287' };
	}, []);

	const tutors = data?.tutors ?? NO_TUTORS;
	const ratings = data?.ratings;
	const fallbackPhone = data?.fallbackPhone ?? null;

	const ratingOf = (tutor: StrapiTutoringProfile): TutorRatingSummary =>
		ratings?.[tutor.documentId] ?? EMPTY_RATING;

	const subjectFilters = useMemo(() => {
		const acc: { id: string; name: string; count: number }[] = [];
		tutors.forEach((tutor) => {
			(tutor.subjects ?? []).forEach((subject) => {
				const existing = acc.find((s) => s.id === subject.slug);
				if (existing) existing.count++;
				else acc.push({ id: subject.slug, name: subject.title, count: 1 });
			});
		});
		return [{ id: 'all', name: 'Tüm Dersler', count: tutors.length }, ...acc];
	}, [tutors]);

	const filteredTutors = useMemo(() => {
		const rating = (tutor: StrapiTutoringProfile): TutorRatingSummary =>
			ratings?.[tutor.documentId] ?? EMPTY_RATING;
		const query = normalizeTurkish(searchQuery.trim());
		return tutors
			.filter((tutor) => {
				const matchesSubject =
					selectedSubject === 'all' ||
					(tutor.subjects ?? []).some((subject) => subject.slug === selectedSubject);
				const matchesSearch =
					!query ||
					normalizeTurkish(tutor.name).includes(query) ||
					normalizeTurkish(tutor.title).includes(query) ||
					normalizeTurkish(tutor.experties ?? '').includes(query);
				return matchesSubject && matchesSearch;
			})
			.sort((a, b) => {
				switch (sortBy) {
					case 'price':
						return a.price - b.price;
					case 'experience':
						return b.exprienceYears - a.exprienceYears;
					default:
						return rating(b).average - rating(a).average || rating(b).count - rating(a).count;
				}
			});
	}, [tutors, searchQuery, selectedSubject, sortBy, ratings]);

	const scrollToTutors = () =>
		scrollRef.current?.scrollTo({ y: tutorSectionY.current, animated: true });
	const scrollToSteps = () =>
		scrollRef.current?.scrollTo({ y: stepsSectionY.current, animated: true });

	const clearFilters = () => {
		setSearchQuery('');
		setSelectedSubject('all');
	};

	return (
		<View className="flex-1 bg-white">
			<Stack.Screen options={{ title: 'Özel Ders' }} />
			{loading && !data ? (
				<LoadingState />
			) : error && !data ? (
				<ErrorState message={error} onRetry={reload} />
			) : (
				<ScrollView ref={scrollRef} className="flex-1" showsVerticalScrollIndicator={false}>
					<View className="bg-slate-900 px-6 py-12">
						<Text className="text-center font-bold text-3xl text-white leading-tight">
							Uzman Öğretmenlerle <Text className="text-amber-400">Birebir Eğitim</Text>
						</Text>
						<Text className="mt-4 text-center text-base text-slate-300 leading-relaxed">
							Alanında uzman öğretmenlerle hedeflerinize özel ders alın. Kişiselleştirilmiş bir
							öğrenme deneyimi ile potansiyelinizi zirveye taşıyın.
						</Text>
						<View className="mt-8 gap-3">
							<Pressable
								onPress={scrollToTutors}
								className="items-center rounded-full bg-amber-500 py-3.5 active:bg-amber-600"
							>
								<Text className="font-bold text-slate-900 text-sm">Hemen Başla</Text>
							</Pressable>
							<Pressable
								onPress={scrollToSteps}
								className="items-center rounded-full border border-slate-600 py-3.5 active:bg-slate-800"
							>
								<Text className="font-bold text-sm text-white">Nasıl Çalışır?</Text>
							</Pressable>
						</View>
					</View>

					<View
						onLayout={(e) => {
							tutorSectionY.current = e.nativeEvent.layout.y;
						}}
						className="px-4 py-8"
					>
						<View className="mb-4 rounded-2xl border border-slate-200 bg-white p-4">
							<ScrollView
								horizontal
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={{ gap: 8 }}
								className="mb-3 grow-0"
							>
								{subjectFilters.map((subject) => (
									<Pressable
										key={subject.id}
										onPress={() => setSelectedSubject(subject.id)}
										className={cn(
											'rounded-full px-4 py-2',
											selectedSubject === subject.id ? 'bg-blue-600' : 'bg-slate-100',
										)}
									>
										<Text
											className={cn(
												'font-medium text-sm',
												selectedSubject === subject.id ? 'text-white' : 'text-slate-600',
											)}
										>
											{subject.name} ({subject.count})
										</Text>
									</Pressable>
								))}
							</ScrollView>

							<View className="mb-3 flex-row items-center gap-2 rounded-xl border border-slate-200 px-3">
								<Search size={16} color="#64748b" />
								<TextInput
									value={searchQuery}
									onChangeText={setSearchQuery}
									placeholder="Öğretmen ara..."
									placeholderTextColor="#94a3b8"
									className="flex-1 py-2.5 text-slate-900 text-sm"
								/>
							</View>

							<View className="flex-row gap-2">
								{SORT_OPTIONS.map((option) => (
									<Pressable
										key={option.id}
										onPress={() => setSortBy(option.id)}
										className={cn(
											'flex-1 items-center rounded-xl border px-2 py-2',
											sortBy === option.id
												? 'border-blue-600 bg-blue-50'
												: 'border-slate-200 bg-white',
										)}
									>
										<Text
											className={cn(
												'font-medium text-xs',
												sortBy === option.id ? 'text-blue-600' : 'text-slate-500',
											)}
										>
											{option.label}
										</Text>
									</Pressable>
								))}
							</View>
						</View>

						{filteredTutors.length > 0 ? (
							<View className="gap-5">
								{filteredTutors.map((tutor) => (
									<TutorCard
										key={tutor.id}
										tutor={tutor}
										summary={ratingOf(tutor)}
										fallbackPhone={fallbackPhone}
										onPress={() => router.push(tutorPath(tutor))}
									/>
								))}
							</View>
						) : (
							<EmptyState
								title="Öğretmen bulunamadı"
								description="Arama kriterlerinizi değiştirmeyi deneyin veya tüm öğretmenleri görüntüleyin"
								actionLabel="Filtreleri Temizle"
								onAction={clearFilters}
							/>
						)}
					</View>

					<View
						onLayout={(e) => {
							stepsSectionY.current = e.nativeEvent.layout.y;
						}}
						className="bg-slate-50 px-6 py-12"
					>
						<Text className="text-center font-bold text-2xl text-slate-900">
							Geleceğinizi 3 Adımda Planlayın
						</Text>
						<Text className="mt-2 text-center text-base text-slate-600">
							Öğrenme yolculuğunuzu başlatmak hiç bu kadar kolay olmamıştı
						</Text>
						<View className="mt-8 gap-6">
							{STEPS.map((step, index) => (
								<View key={step.title} className="flex-row gap-4">
									<View className="size-10 items-center justify-center rounded-full bg-amber-100">
										<Text className="font-bold text-amber-600 text-lg">{index + 1}</Text>
									</View>
									<View className="flex-1">
										<Text className="font-bold text-lg text-slate-900">{step.title}</Text>
										<Text className="mt-1 text-slate-600 text-sm leading-relaxed">
											{step.description}
										</Text>
									</View>
								</View>
							))}
						</View>
					</View>

					<View className="items-center bg-slate-900 px-6 py-12">
						<Text className="text-center font-bold text-2xl text-white">
							Geleceğiniz İçin İlk Adımı Bugün Atın
						</Text>
						<Text className="mt-3 text-center text-base text-slate-300 leading-relaxed">
							Öğretmeninizi seçin, ücretsiz deneme dersinizi planlayın ve farkı yaşayın.
						</Text>
						<Pressable
							onPress={scrollToTutors}
							className="mt-6 rounded-full bg-amber-500 px-8 py-3.5 active:bg-amber-600"
						>
							<Text className="font-bold text-slate-900 text-sm">Öğretmenleri Gör</Text>
						</Pressable>
					</View>
				</ScrollView>
			)}
		</View>
	);
}
