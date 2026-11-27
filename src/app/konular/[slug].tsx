import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { CourseCard } from '@/components/shared/course-card';
import { Reveal } from '@/components/shared/motion';
import { EmptyState, ErrorState, LoadingState, SectionHeading } from '@/components/shared/states';
import { useAsync } from '@/hooks/use-async';
import { getCourseIcon } from '@/lib/icons';
import {
	type CourseProgress,
	getCourseProgress,
	getCoursesBySubject,
	getSubjectBySlug,
	type StrapiCourse,
} from '@/lib/strapi';
import { useThemeColors } from '@/lib/theme';
import { normalizeTurkish } from '@/lib/utils';
import { useJWT } from '@/stores/auth-store';

function progressPercent(progress: CourseProgress): number {
	if (progress.status === 'completed') return 100;
	if (!progress.totalLessons || !progress.completedLessons) return 0;
	if (progress.completedLessons >= progress.totalLessons) return 100;
	return Math.min(Math.round((progress.completedLessons / progress.totalLessons) * 100), 99);
}

export default function SubjectScreen() {
	const router = useRouter();
	const { slug } = useLocalSearchParams<{ slug: string }>();
	const jwt = useJWT();
	const [query, setQuery] = useState('');
	const colors = useThemeColors();

	const { data, loading, error, reload } = useAsync(async () => {
		const subject = await getSubjectBySlug(slug);
		if (!subject) return null;
		const courses = await getCoursesBySubject(subject.slug);
		const progress = new Map<string, number>();
		if (jwt) {
			const entries = await Promise.all(
				courses.map(async (course) => {
					try {
						return [
							course.documentId,
							progressPercent(await getCourseProgress(course.documentId, jwt)),
						] as const;
					} catch {
						return [course.documentId, 0] as const;
					}
				}),
			);
			for (const [documentId, percent] of entries) progress.set(documentId, percent);
		}
		return { subject, courses, progress };
	}, [slug, jwt]);

	if (loading) {
		return (
			<>
				<Stack.Screen options={{ title: 'Konu' }} />
				<LoadingState label="Konu yükleniyor..." />
			</>
		);
	}

	if (error) {
		return (
			<>
				<Stack.Screen options={{ title: 'Konu' }} />
				<ErrorState message={error} onRetry={reload} />
			</>
		);
	}

	if (!data) {
		return (
			<>
				<Stack.Screen options={{ title: 'Konu' }} />
				<View className="flex-1 justify-center bg-background">
					<EmptyState title="Konu bulunamadı" />
				</View>
			</>
		);
	}

	const { subject, courses, progress } = data;
	const Icon = getCourseIcon(subject.icon?.name);
	const normalizedQuery = normalizeTurkish(query.trim());
	const filtered = courses.filter(
		(course) =>
			!normalizedQuery ||
			normalizeTurkish(course.title ?? '').includes(normalizedQuery) ||
			normalizeTurkish(course.description ?? '').includes(normalizedQuery),
	);
	const inProgress = filtered.filter((course) => (progress.get(course.documentId) ?? 0) > 0);
	const popular = filtered.filter((course) => course.isPopular).slice(0, 3);
	const popularSet = new Set(popular);
	const rest = filtered.filter((course) => !popularSet.has(course));

	const openCourse = (course: StrapiCourse) => router.push(`/courses/${course.slug}`);

	return (
		<>
			<Stack.Screen options={{ title: subject.title }} />
			<ScrollView className="flex-1 bg-background">
				<View className="gap-8 p-4">
					<Reveal delay={20}>
						<View className="items-center pt-4">
							<View className="mb-3 rounded-full bg-accent p-3">
								<Icon size={24} color={colors.primary} />
							</View>
							<Text className="text-center font-bold text-3xl text-foreground">
								{subject.title} Öğren
							</Text>
							<Text className="mt-2 text-center text-lg text-muted-foreground">
								{subject.title} dersinde başarı elde et.
							</Text>
						</View>
					</Reveal>

					{courses.length === 0 ? (
						<EmptyState title="Bu konu için ders bulunamadı" />
					) : (
						<>
							{inProgress.length > 0 ? (
								<View>
									<SectionHeading
										title="📈 Kaldığın Yerden Devam Et:"
										actionLabel={`Hepsini Gör (${inProgress.length} ders)`}
										onAction={() => router.push('/derslerim')}
									/>
									<View className="gap-4">
										{inProgress.slice(0, 2).map((course) => (
											<CourseCard
												key={course.documentId}
												course={course}
												progress={progress.get(course.documentId) ?? null}
												hasJwt={!!jwt}
												onPress={() => openCourse(course)}
											/>
										))}
									</View>
								</View>
							) : null}

							<Reveal delay={80}>
								<TextInput
									accessibilityLabel="Ders ara"
									value={query}
									onChangeText={setQuery}
									placeholder="Ders ara..."
									placeholderTextColor={colors.mutedForeground}
									className="rounded-xl border border-input bg-card px-4 py-3 text-base text-foreground"
								/>
							</Reveal>

							{filtered.length === 0 ? (
								<EmptyState title="Aradığınız kriterlere uygun ders bulunamadı" />
							) : null}

							{popular.length > 0 ? (
								<View>
									<SectionHeading title={`Popüler ${subject.title} Dersleri`} />
									<View className="gap-4">
										{popular.map((course) => (
											<CourseCard
												key={course.documentId}
												course={course}
												progress={progress.get(course.documentId) ?? null}
												hasJwt={!!jwt}
												onPress={() => openCourse(course)}
											/>
										))}
									</View>
								</View>
							) : null}

							{rest.length > 0 ? (
								<View>
									<SectionHeading title={`Tüm ${subject.title} Dersleri`} />
									<View className="gap-4">
										{rest.map((course) => (
											<CourseCard
												key={course.documentId}
												course={course}
												progress={progress.get(course.documentId) ?? null}
												hasJwt={!!jwt}
												onPress={() => openCourse(course)}
											/>
										))}
									</View>
								</View>
							) : null}
						</>
					)}
				</View>
			</ScrollView>
		</>
	);
}
