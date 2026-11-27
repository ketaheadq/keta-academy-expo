import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import {
	BookOpen,
	CheckCircle,
	Circle,
	Clock,
	GraduationCap,
	Paperclip,
	Target,
} from 'lucide-react-native';
import { useMemo, useRef, useState } from 'react';
import { Image, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import QuizModal from '@/components/features/quiz/quiz-modal';
import { Reveal } from '@/components/shared/motion';
import { RichText } from '@/components/shared/rich-text';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { YouTubePlayer } from '@/components/shared/youtube-player';
import { useAsync } from '@/hooks/use-async';
import { getLessonExams } from '@/lib/deneme';
import { withAppReturn } from '@/lib/routes';
import {
	getCourse,
	getLessonsByCourseId,
	getUserLessonProgress,
	mediaUrl,
	type StrapiQuiz,
	startCourse,
	updateLessonProgress,
} from '@/lib/strapi';
import { useThemeColors } from '@/lib/theme';
import { cn, formatDuration } from '@/lib/utils';
import { useJWT } from '@/stores/auth-store';

export default function CourseDetailScreen() {
	const router = useRouter();
	const { slug, ders_ismi } = useLocalSearchParams<{ slug: string; ders_ismi?: string }>();
	const jwt = useJWT();
	const scrollRef = useRef<ScrollView>(null);
	const [extraCompleted, setExtraCompleted] = useState<string[]>([]);
	const [activeQuiz, setActiveQuiz] = useState<StrapiQuiz | null>(null);
	const [completingId, setCompletingId] = useState<string | null>(null);
	const [progressError, setProgressError] = useState(false);
	const colors = useThemeColors();

	const { data, loading, error, reload } = useAsync(async () => {
		// Navigating to another course starts from a clean local state.
		setExtraCompleted([]);
		setActiveQuiz(null);
		const course = await getCourse(slug);
		if (!course) return null;
		const links = await getLessonsByCourseId(course.id);
		const exams = await getLessonExams(links.map((link) => link.lesson.documentId));
		let completed: string[] = [];
		if (jwt) {
			// Opening a course while signed in counts as starting it (shows up in /derslerim).
			startCourse(course.documentId, jwt).catch(() => {});
			const rows = await getUserLessonProgress(undefined, jwt);
			completed = rows.filter((row) => row.isCompleted).map((row) => row.documentId);
		}
		return { course, links, exams, completed };
	}, [slug, jwt]);

	const completedIds = useMemo(() => {
		const set = new Set(data?.completed ?? []);
		for (const id of extraCompleted) set.add(id);
		return set;
	}, [data, extraCompleted]);

	if (loading) {
		return (
			<>
				<Stack.Screen options={{ title: 'Kurs' }} />
				<LoadingState label="Kurs yükleniyor..." />
			</>
		);
	}

	if (error) {
		return (
			<>
				<Stack.Screen options={{ title: 'Kurs' }} />
				<ErrorState message={error} onRetry={reload} />
			</>
		);
	}

	if (!data) {
		return (
			<>
				<Stack.Screen options={{ title: 'Kurs' }} />
				<View className="flex-1 justify-center bg-background">
					<EmptyState
						title="Aradığınız kurs bulunamadı."
						actionLabel="Ana Sayfaya Dön"
						onAction={() => router.replace('/')}
					/>
				</View>
			</>
		);
	}

	const { course, links, exams } = data;
	const matchedIndex = links.findIndex((link) => link.lesson.slug === ders_ismi);
	const currentIndex = matchedIndex >= 0 ? matchedIndex : 0;
	const current = links[currentIndex]?.lesson;
	const totalLessons = links.length;
	const completedLessons = links.filter((link) => completedIds.has(link.lesson.documentId)).length;
	const isCurrentComplete = current ? completedIds.has(current.documentId) : false;
	const exam = current ? exams[current.documentId] : undefined;
	const thumbnail = mediaUrl(course.thumbnail?.url);
	const coursePath = `/courses/${encodeURIComponent(slug)}${
		ders_ismi ? `?ders_ismi=${encodeURIComponent(ders_ismi)}` : ''
	}`;
	const loginHref = withAppReturn('/giris', coursePath);

	const selectLesson = (index: number) => {
		const link = links[index];
		if (!link) return;
		router.setParams({ ders_ismi: link.lesson.slug });
		scrollRef.current?.scrollTo({ y: 0, animated: true });
	};

	const markComplete = async (documentId: string) => {
		if (!jwt || completedIds.has(documentId) || completingId) return;
		setCompletingId(documentId);
		setProgressError(false);
		try {
			await updateLessonProgress(documentId, true, jwt);
			setExtraCompleted((prev) => (prev.includes(documentId) ? prev : [...prev, documentId]));
		} catch (cause) {
			console.error('Could not update lesson progress', cause);
			setProgressError(true);
		} finally {
			setCompletingId(null);
		}
	};

	const openQuiz = (quiz: StrapiQuiz) => {
		if (!jwt) {
			router.push(loginHref);
			return;
		}
		setActiveQuiz(quiz);
	};

	return (
		<>
			<Stack.Screen options={{ title: course.title }} />
			<ScrollView ref={scrollRef} className="flex-1 bg-background">
				<View className="gap-6 p-4">
					{!jwt ? (
						<View className="rounded-xl border border-border bg-accent p-4">
							<Text className="text-accent-foreground text-sm">
								<Text className="font-bold">Not:</Text> İlerlemenizi kaydetmek için{' '}
								<Text className="text-primary underline" onPress={() => router.push(loginHref)}>
									giriş yapın
								</Text>
								.
							</Text>
						</View>
					) : null}

					{current ? (
						<Reveal key={current.documentId} delay={40}>
							<View className="overflow-hidden rounded-2xl border border-border bg-card shadow-black/5 shadow-sm">
								<YouTubePlayer
									key={current.documentId}
									videoURL={current.videoURL}
									height={220}
									onEnded={() => void markComplete(current.documentId)}
								/>
								<View className="gap-4 p-4">
									<View>
										<Text className="font-bold text-foreground text-xl">{current.title}</Text>
										<Text className="mt-1 text-muted-foreground">{current.description}</Text>
									</View>

									<RichText blocks={current.content} />

									{exam ? (
										<Link href={`/deneme-sinavlari/${exam.slug}`} asChild>
											<Pressable className="flex-row items-center gap-2 rounded-xl border border-border bg-accent p-3 active:bg-secondary">
												<Target size={16} color={colors.primary} />
												<Text className="flex-1 font-medium text-primary text-sm">
													Bu konunun mini denemesini çöz: {exam.baslik}
												</Text>
											</Pressable>
										</Link>
									) : null}

									{current.attachments?.map((attachment) => (
										<Pressable
											key={attachment.id}
											onPress={() =>
												void Linking.openURL(mediaUrl(attachment.url) ?? attachment.url)
											}
											className="flex-row items-center gap-2 py-1 active:opacity-70"
										>
											<Paperclip size={16} color={colors.primary} />
											<Text className="flex-1 text-primary text-sm underline">
												{attachment.name}
											</Text>
										</Pressable>
									))}

									<View className="flex-row flex-wrap items-center gap-2">
										<Pressable
											disabled={currentIndex === 0}
											onPress={() => selectLesson(currentIndex - 1)}
											className={cn(
												'rounded-xl border border-input bg-card px-5 py-2.5 active:bg-muted',
												currentIndex === 0 && 'opacity-40',
											)}
										>
											<Text className="font-semibold text-foreground text-sm">Önceki</Text>
										</Pressable>
										<Pressable
											disabled={currentIndex >= totalLessons - 1}
											onPress={() => selectLesson(currentIndex + 1)}
											className={cn(
												'rounded-xl border border-input bg-card px-5 py-2.5 active:bg-muted',
												currentIndex >= totalLessons - 1 && 'opacity-40',
											)}
										>
											<Text className="font-semibold text-foreground text-sm">Sonraki</Text>
										</Pressable>

										{!jwt ? (
											<Pressable
												onPress={() => router.push(loginHref)}
												className="rounded-xl border border-input bg-card px-5 py-2.5 active:bg-muted"
											>
												<Text className="font-semibold text-foreground text-sm">Giriş Yap</Text>
											</Pressable>
										) : isCurrentComplete ? (
											<View className="flex-row items-center gap-2 rounded-xl bg-success/10 px-5 py-2.5">
												<CheckCircle size={16} color={colors.success} />
												<Text className="font-semibold text-sm text-success">Tamamlandı</Text>
											</View>
										) : (
											<Pressable
												onPress={() => void markComplete(current.documentId)}
												disabled={Boolean(completingId)}
												className="flex-row items-center gap-2 rounded-xl bg-primary px-5 py-2.5 active:bg-primary/90 disabled:opacity-50"
											>
												<Circle size={16} color={colors.primaryForeground} />
												<Text className="font-semibold text-primary-foreground text-sm">
													{completingId ? 'Kaydediliyor...' : 'Tamamlandı İşaretle'}
												</Text>
											</Pressable>
										)}

										{current.quiz?.questions?.length ? (
											<Pressable
												onPress={() => openQuiz(current.quiz as StrapiQuiz)}
												className="flex-row items-center gap-2 rounded-xl border border-input bg-secondary px-5 py-2.5 active:bg-accent"
											>
												<Target size={16} color={colors.secondaryForeground} />
												<Text className="font-semibold text-secondary-foreground text-sm">
													Quiz Çöz
												</Text>
											</Pressable>
										) : null}
									</View>
								</View>
							</View>
						</Reveal>
					) : null}

					{progressError ? (
						<View className="rounded-xl bg-destructive/10 p-3">
							<Text className="text-destructive text-sm">
								İlerleme kaydedilemedi. Bağlantını kontrol edip tekrar dene.
							</Text>
						</View>
					) : null}

					<Reveal delay={100}>
						<View className="rounded-2xl border border-border bg-card p-4 shadow-black/5 shadow-sm">
							<View className="mb-3 flex-row items-center gap-2">
								<BookOpen size={20} color={colors.foreground} />
								<Text className="font-bold text-foreground text-lg">Bu Kurs Hakkında</Text>
							</View>
							<Text className="mb-2 font-semibold text-foreground">Kurs Açıklaması</Text>
							<Text className="mb-4 text-muted-foreground">{course.description}</Text>
							<View className="gap-2">
								<InfoRow icon={Target} text={`Konu: ${course.subject?.title ?? ''}`} />
								<InfoRow
									icon={GraduationCap}
									text={`Sınıf: ${(course.grades ?? []).map((grade) => grade.title).join(', ')}`}
								/>
								<InfoRow icon={Clock} text={`Toplam Süre: ${formatDuration(course.duration)}`} />
								<InfoRow icon={BookOpen} text={`${totalLessons} Ders`} />
							</View>
							{thumbnail ? (
								<Image
									source={{ uri: thumbnail }}
									accessibilityLabel={course.thumbnail?.alternativeText || course.title}
									resizeMode="cover"
									style={{ width: '100%', height: 192, borderRadius: 12, marginTop: 16 }}
								/>
							) : null}
						</View>
					</Reveal>

					<Reveal delay={160}>
						<View className="rounded-2xl border border-border bg-card p-4 shadow-black/5 shadow-sm">
							<View className="flex-row items-center justify-between">
								<Text className="font-bold text-foreground text-lg">Kurs Dersleri</Text>
								<View className="rounded-full bg-muted px-2.5 py-1">
									<Text className="font-semibold text-muted-foreground text-xs">
										{completedLessons}/{totalLessons}
									</Text>
								</View>
							</View>
							<Text className="mt-1 mb-3 text-muted-foreground text-sm">
								Kurstaki ilerlemenizi takip edin
							</Text>
							<View className="gap-2">
								{links.map((link, index) => {
									const lesson = link.lesson;
									const done = completedIds.has(lesson.documentId);
									const active = index === currentIndex;
									return (
										<Pressable
											key={lesson.documentId}
											onPress={() => selectLesson(index)}
											className={cn(
												'flex-row items-start gap-3 rounded-xl border-2 p-3',
												active
													? 'border-primary bg-accent'
													: 'border-transparent bg-card active:bg-muted',
											)}
										>
											<View className="mt-0.5">
												{done ? (
													<CheckCircle size={20} color={colors.success} />
												) : (
													<Circle size={20} color={colors.mutedForeground} />
												)}
											</View>
											<View className="flex-1">
												<View className="flex-row items-center gap-2">
													<Text
														className="flex-1 font-medium text-foreground text-sm"
														numberOfLines={1}
													>
														{index + 1}. {lesson.title}
													</Text>
													{lesson.quiz ? (
														<View className="rounded-full border border-input px-2 py-0.5">
															<Text className="text-muted-foreground text-xs">Quiz</Text>
														</View>
													) : null}
												</View>
												<Text className="mt-1 text-muted-foreground text-xs" numberOfLines={2}>
													{lesson.description}
												</Text>
											</View>
										</Pressable>
									);
								})}
							</View>
						</View>
					</Reveal>
				</View>
			</ScrollView>
			{activeQuiz && jwt ? (
				<QuizModal
					key={activeQuiz.documentId}
					visible
					quiz={activeQuiz}
					jwt={jwt}
					onClose={() => setActiveQuiz(null)}
				/>
			) : null}
		</>
	);
}

function InfoRow({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
	const colors = useThemeColors();
	return (
		<View className="flex-row items-center gap-2">
			<Icon size={16} color={colors.mutedForeground} />
			<Text className="flex-1 text-muted-foreground text-sm">{text}</Text>
		</View>
	);
}
