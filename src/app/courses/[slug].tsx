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
import { RichText } from '@/components/shared/rich-text';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { YouTubePlayer } from '@/components/shared/youtube-player';
import { useAsync } from '@/hooks/use-async';
import { getLessonExams } from '@/lib/deneme';
import {
	getCourse,
	getLessonsByCourseId,
	getUserLessonProgress,
	mediaUrl,
	type StrapiQuiz,
	startCourse,
	updateLessonProgress,
} from '@/lib/strapi';
import { cn, formatDuration } from '@/lib/utils';
import { useJWT } from '@/stores/auth-store';

export default function CourseDetailScreen() {
	const router = useRouter();
	const { slug, ders_ismi } = useLocalSearchParams<{ slug: string; ders_ismi?: string }>();
	const jwt = useJWT();
	const scrollRef = useRef<ScrollView>(null);
	const [extraCompleted, setExtraCompleted] = useState<string[]>([]);
	const [activeQuiz, setActiveQuiz] = useState<StrapiQuiz | null>(null);

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
				<View className="flex-1 justify-center bg-slate-50">
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

	const selectLesson = (index: number) => {
		const link = links[index];
		if (!link) return;
		router.setParams({ ders_ismi: link.lesson.slug });
		scrollRef.current?.scrollTo({ y: 0, animated: true });
	};

	const markComplete = async (documentId: string) => {
		if (!jwt || completedIds.has(documentId)) return;
		try {
			await updateLessonProgress(documentId, true, jwt);
			setExtraCompleted((prev) => [...prev, documentId]);
		} catch (cause) {
			console.error('Could not update lesson progress', cause);
		}
	};

	const openQuiz = (quiz: StrapiQuiz) => {
		if (!jwt) {
			router.push('/giris');
			return;
		}
		setActiveQuiz(quiz);
	};

	return (
		<>
			<Stack.Screen options={{ title: course.title }} />
			<ScrollView ref={scrollRef} className="flex-1 bg-slate-50">
				<View className="gap-6 p-4">
					{!jwt ? (
						<View className="rounded-xl border border-blue-100 bg-blue-50 p-4">
							<Text className="text-blue-700 text-sm">
								<Text className="font-bold">Not:</Text> İlerlemenizi kaydetmek için{' '}
								<Text className="text-blue-600 underline" onPress={() => router.push('/giris')}>
									giriş yapın
								</Text>
								.
							</Text>
						</View>
					) : null}

					{current ? (
						<View className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
							<YouTubePlayer
								key={current.documentId}
								videoURL={current.videoURL}
								height={220}
								onEnded={() => void markComplete(current.documentId)}
							/>
							<View className="gap-4 p-4">
								<View>
									<Text className="font-bold text-slate-900 text-xl">{current.title}</Text>
									<Text className="mt-1 text-slate-500">{current.description}</Text>
								</View>

								<RichText blocks={current.content} />

								{exam ? (
									<Link href={`/deneme-sinavlari/${exam.slug}`} asChild>
										<Pressable className="flex-row items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 active:bg-blue-100">
											<Target size={16} color="#2563eb" />
											<Text className="flex-1 font-medium text-blue-700 text-sm">
												Bu konunun mini denemesini çöz: {exam.baslik}
											</Text>
										</Pressable>
									</Link>
								) : null}

								{current.attachments?.map((attachment) => (
									<Pressable
										key={attachment.id}
										onPress={() => void Linking.openURL(mediaUrl(attachment.url) ?? attachment.url)}
										className="flex-row items-center gap-2 py-1 active:opacity-70"
									>
										<Paperclip size={16} color="#2563eb" />
										<Text className="flex-1 text-blue-600 text-sm underline">
											{attachment.name}
										</Text>
									</Pressable>
								))}

								<View className="flex-row flex-wrap items-center gap-2">
									<Pressable
										disabled={currentIndex === 0}
										onPress={() => selectLesson(currentIndex - 1)}
										className={cn(
											'rounded-xl border border-slate-200 bg-white px-5 py-2.5 active:bg-slate-50',
											currentIndex === 0 && 'opacity-40',
										)}
									>
										<Text className="font-semibold text-slate-700 text-sm">Önceki</Text>
									</Pressable>
									<Pressable
										disabled={currentIndex >= totalLessons - 1}
										onPress={() => selectLesson(currentIndex + 1)}
										className={cn(
											'rounded-xl border border-slate-200 bg-white px-5 py-2.5 active:bg-slate-50',
											currentIndex >= totalLessons - 1 && 'opacity-40',
										)}
									>
										<Text className="font-semibold text-slate-700 text-sm">Sonraki</Text>
									</Pressable>

									{!jwt ? (
										<Pressable
											onPress={() => router.push('/giris')}
											className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 active:bg-slate-50"
										>
											<Text className="font-semibold text-slate-700 text-sm">Giriş Yap</Text>
										</Pressable>
									) : isCurrentComplete ? (
										<View className="flex-row items-center gap-2 rounded-xl bg-green-50 px-5 py-2.5">
											<CheckCircle size={16} color="#16a34a" />
											<Text className="font-semibold text-green-700 text-sm">Tamamlandı</Text>
										</View>
									) : (
										<Pressable
											onPress={() => void markComplete(current.documentId)}
											className="flex-row items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 active:bg-blue-700"
										>
											<Circle size={16} color="#ffffff" />
											<Text className="font-semibold text-sm text-white">Tamamlandı İşaretle</Text>
										</Pressable>
									)}

									{current.quiz?.questions?.length ? (
										<Pressable
											onPress={() => openQuiz(current.quiz as StrapiQuiz)}
											className="flex-row items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-5 py-2.5 active:bg-blue-100"
										>
											<Target size={16} color="#2563eb" />
											<Text className="font-semibold text-blue-700 text-sm">Quiz Çöz</Text>
										</Pressable>
									) : null}
								</View>
							</View>
						</View>
					) : null}

					<View className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
						<View className="mb-3 flex-row items-center gap-2">
							<BookOpen size={20} color="#0f172a" />
							<Text className="font-bold text-lg text-slate-900">Bu Kurs Hakkında</Text>
						</View>
						<Text className="mb-2 font-semibold text-slate-900">Kurs Açıklaması</Text>
						<Text className="mb-4 text-slate-500">{course.description}</Text>
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

					<View className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
						<View className="flex-row items-center justify-between">
							<Text className="font-bold text-lg text-slate-900">Kurs Dersleri</Text>
							<View className="rounded-full bg-slate-100 px-2.5 py-1">
								<Text className="font-semibold text-slate-600 text-xs">
									{completedLessons}/{totalLessons}
								</Text>
							</View>
						</View>
						<Text className="mt-1 mb-3 text-slate-500 text-sm">
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
												? 'border-blue-600 bg-blue-50'
												: 'border-transparent bg-white active:bg-slate-50',
										)}
									>
										<View className="mt-0.5">
											{done ? (
												<CheckCircle size={20} color="#16a34a" />
											) : (
												<Circle size={20} color="#64748b" />
											)}
										</View>
										<View className="flex-1">
											<View className="flex-row items-center gap-2">
												<Text
													className="flex-1 font-medium text-slate-900 text-sm"
													numberOfLines={1}
												>
													{index + 1}. {lesson.title}
												</Text>
												{lesson.quiz ? (
													<View className="rounded-full border border-slate-200 px-2 py-0.5">
														<Text className="text-slate-600 text-xs">Quiz</Text>
													</View>
												) : null}
											</View>
											<Text className="mt-1 text-slate-500 text-xs" numberOfLines={2}>
												{lesson.description}
											</Text>
										</View>
									</Pressable>
								);
							})}
						</View>
					</View>
				</View>
			</ScrollView>
			{activeQuiz && jwt ? (
				<QuizModal visible quiz={activeQuiz} jwt={jwt} onClose={() => setActiveQuiz(null)} />
			) : null}
		</>
	);
}

function InfoRow({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
	return (
		<View className="flex-row items-center gap-2">
			<Icon size={16} color="#64748b" />
			<Text className="flex-1 text-slate-500 text-sm">{text}</Text>
		</View>
	);
}
