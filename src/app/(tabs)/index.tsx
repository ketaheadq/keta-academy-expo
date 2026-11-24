import { useRouter } from 'expo-router';
import {
	ArrowRight,
	ChevronLeft,
	ChevronRight,
	FileText,
	GraduationCap,
} from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	FlatList,
	Image,
	Linking,
	type NativeScrollEvent,
	type NativeSyntheticEvent,
	Pressable,
	ScrollView,
	Text,
	useWindowDimensions,
	View,
} from 'react-native';
import { DenemeCard } from '@/components/features/deneme/deneme-card';
import { CourseCard } from '@/components/shared/course-card';
import { SectionHeading } from '@/components/shared/states';
import { type DenemeSummary, getDenemeler } from '@/lib/deneme';
import { DEFAULT_SLIDES, getHomeSlides, type Slide } from '@/lib/home';
import { toAppRoute } from '@/lib/routes';
import {
	getCourseProgress,
	getPublishedCourses,
	getSubjects,
	type StrapiCourse,
	type StrapiSubject,
} from '@/lib/strapi';
import { useJWT } from '@/stores/auth-store';

const SLIDER_INTERVAL = 6000;

const SAMPLE_TOPICS = [
	{ label: 'Üslü İfadeler', value: 83 },
	{ label: 'Çarpanlar ve Katlar', value: 60 },
	{ label: 'Kareköklü İfadeler', value: 25 },
];

function HomeSlider({ slides }: { slides: Slide[] }) {
	const router = useRouter();
	const { width } = useWindowDimensions();
	const itemWidth = width - 40;
	const listRef = useRef<FlatList<Slide>>(null);
	const [index, setIndex] = useState(0);
	const autoplayStopped = useRef(false);

	useEffect(() => {
		if (slides.length < 2 || autoplayStopped.current) return;
		const timer = setInterval(() => {
			setIndex((current) => {
				const next = (current + 1) % slides.length;
				listRef.current?.scrollToOffset({ offset: next * itemWidth, animated: true });
				return next;
			});
		}, SLIDER_INTERVAL);
		return () => clearInterval(timer);
	}, [slides.length, itemWidth]);

	const onScroll = useCallback(
		(event: NativeSyntheticEvent<NativeScrollEvent>) => {
			const next = Math.round(event.nativeEvent.contentOffset.x / itemWidth);
			if (next !== index && next >= 0 && next < slides.length) setIndex(next);
		},
		[itemWidth, index, slides.length],
	);

	const openSlide = (slide: Slide) => {
		if (!slide.butonYazisi || !slide.link) return;
		const route = toAppRoute(slide.link);
		if (!route) return;
		if (/^https?:\/\//.test(route)) void Linking.openURL(route);
		else router.push(route as never);
	};

	return (
		<View className="mb-8">
			<FlatList
				ref={listRef}
				data={slides}
				keyExtractor={(slide) => String(slide.id)}
				horizontal
				pagingEnabled
				showsHorizontalScrollIndicator={false}
				onScroll={onScroll}
				onScrollBeginDrag={() => {
					autoplayStopped.current = true;
				}}
				scrollEventThrottle={16}
				contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
				renderItem={({ item }) => (
					<View style={{ width: itemWidth }} className="overflow-hidden rounded-3xl bg-slate-900">
						{item.gorselUrl ? (
							<Image
								source={{ uri: item.gorselUrl }}
								accessibilityLabel={item.baslik}
								resizeMode="cover"
								style={{ width: '100%', height: 240 }}
							/>
						) : (
							<View className="h-24 w-full bg-blue-600" />
						)}
						<View className="gap-3 p-6">
							<Text className="font-extrabold text-2xl text-white leading-tight">
								{item.baslik}
							</Text>
							{item.altMetin ? (
								<Text className="text-slate-300 text-sm leading-relaxed">{item.altMetin}</Text>
							) : null}
							{item.butonYazisi && item.link ? (
								<Pressable
									onPress={() => openSlide(item)}
									className="mt-1 flex-row items-center self-start rounded-full bg-white px-5 py-2.5 active:bg-slate-100"
								>
									<Text className="font-bold text-slate-900 text-sm">{item.butonYazisi}</Text>
									<ArrowRight size={16} color="#0f172a" style={{ marginLeft: 6 }} />
								</Pressable>
							) : null}
						</View>
					</View>
				)}
			/>
			{slides.length > 1 ? (
				<View className="mt-4 flex-row items-center justify-center gap-2">
					<Pressable
						accessibilityLabel="Önceki slayt"
						onPress={() => {
							const next = (index - 1 + slides.length) % slides.length;
							listRef.current?.scrollToOffset({ offset: next * itemWidth, animated: true });
							setIndex(next);
						}}
						className="rounded-full bg-slate-100 p-1.5 active:bg-slate-200"
					>
						<ChevronLeft size={16} color="#475569" />
					</Pressable>
					{slides.map((slide, dotIndex) => (
						<View
							key={`dot-${slide.id}`}
							className={
								dotIndex === index
									? 'h-2 w-6 rounded-full bg-blue-600'
									: 'h-2 w-2 rounded-full bg-slate-300'
							}
						/>
					))}
					<Pressable
						accessibilityLabel="Sonraki slayt"
						onPress={() => {
							const next = (index + 1) % slides.length;
							listRef.current?.scrollToOffset({ offset: next * itemWidth, animated: true });
							setIndex(next);
						}}
						className="rounded-full bg-slate-100 p-1.5 active:bg-slate-200"
					>
						<ChevronRight size={16} color="#475569" />
					</Pressable>
				</View>
			) : null}
		</View>
	);
}

export default function HomeScreen() {
	const router = useRouter();
	const jwt = useJWT();
	const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
	const [denemeler, setDenemeler] = useState<DenemeSummary[]>([]);
	const [courses, setCourses] = useState<StrapiCourse[]>([]);
	const [subjects, setSubjects] = useState<StrapiSubject[]>([]);
	const [coursesFailed, setCoursesFailed] = useState(false);
	const [progress, setProgress] = useState<Record<string, number>>({});

	useEffect(() => {
		let active = true;
		void getHomeSlides().then((result) => {
			if (active) setSlides(result);
		});
		void getDenemeler().then((result) => {
			if (active) setDenemeler(result);
		});
		getSubjects()
			.then((result) => {
				if (active) setSubjects(result);
			})
			.catch(() => {});
		getPublishedCourses(3)
			.then((result) => {
				if (!active) return;
				setCourses(result);
				setCoursesFailed(false);
			})
			.catch(() => {
				if (active) setCoursesFailed(true);
			});
		return () => {
			active = false;
		};
	}, []);

	useEffect(() => {
		if (!jwt || !courses.length) return;
		let active = true;
		void Promise.all(
			courses.map(async (course) => {
				try {
					const result = await getCourseProgress(course.documentId, jwt);
					const percent =
						result.status === 'completed'
							? 100
							: result.totalLessons
								? Math.min(99, Math.round((result.completedLessons / result.totalLessons) * 100))
								: 0;
					return [course.documentId, percent] as const;
				} catch {
					return null;
				}
			}),
		).then((entries) => {
			if (!active) return;
			setProgress(Object.fromEntries(entries.filter(Boolean) as [string, number][]));
		});
		return () => {
			active = false;
		};
	}, [jwt, courses]);

	const exams = useMemo(() => denemeler.slice(0, 4), [denemeler]);

	return (
		<ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 40 }}>
			<View className="pt-6 pb-10">
				<HomeSlider slides={slides} />

				{exams.length ? (
					<View className="mb-8 px-5">
						<SectionHeading
							title="Bu dönemin denemeleri"
							actionLabel="Tümünü gör"
							onAction={() => router.push('/deneme-sinavlari')}
						/>
						<Text className="-mt-2 mb-4 text-muted-foreground text-sm">
							Kayıt olmadan çöz, netini hemen gör.
						</Text>
						<View className="gap-3">
							{exams.map((deneme) => (
								<DenemeCard
									key={deneme.documentId}
									deneme={deneme}
									onPress={() => router.push(`/deneme-sinavlari/${deneme.slug}`)}
								/>
							))}
						</View>
					</View>
				) : null}

				<View className="mb-8 px-5">
					<SectionHeading
						title="Dersler"
						actionLabel="Tüm dersler"
						onAction={() => router.push('/courses')}
					/>
					{coursesFailed ? (
						<Text className="text-destructive text-sm">
							Dersler şu anda yüklenemiyor. Lütfen biraz sonra tekrar dene.
						</Text>
					) : courses.length ? (
						<View className="gap-3">
							{courses.map((course) => (
								<CourseCard
									key={course.documentId}
									course={course}
									hasJwt={!!jwt}
									progress={progress[course.documentId] ?? null}
									onPress={() => router.push(`/courses/${course.slug}`)}
								/>
							))}
						</View>
					) : (
						<Text className="text-muted-foreground text-sm">Henüz yayımlanmış ders yok.</Text>
					)}
				</View>

				{subjects.length ? (
					<View className="mb-8 px-5">
						<SectionHeading title="Konular" />
						<View className="flex-row flex-wrap gap-2">
							{subjects.map((subject) => (
								<Pressable
									key={subject.documentId}
									onPress={() => router.push(`/konular/${subject.slug}`)}
									className="rounded-full border border-slate-200 bg-white px-4 py-2 active:bg-slate-50"
								>
									<Text className="font-medium text-slate-700 text-sm">{subject.title}</Text>
								</Pressable>
							))}
						</View>
					</View>
				) : null}

				<View className="mb-8 px-5">
					<View className="gap-4 rounded-3xl border border-slate-100 bg-white p-6">
						<View className="flex-row items-center gap-3">
							<View className="size-11 items-center justify-center rounded-2xl bg-blue-50">
								<GraduationCap size={22} color="#2563eb" />
							</View>
							<Text className="font-extrabold text-lg text-slate-900">Çağlar Hoca kimdir?</Text>
						</View>
						<Text className="text-slate-600 leading-relaxed">
							ODTÜ Fizik mezunu Çağlar Hoca, ortaokul ve lise öğrencilerine LGS, TYT, AYT ve okul
							sınavları için matematik dersi veriyor. Konuları ezberletmeden, "neden" ve "nasıl"
							sorularıyla anlatıyor; her öğrenciyle seviyesine ve hedefine göre ilerliyor.
						</Text>
						<Pressable
							onPress={() => router.push('/ozel-ders')}
							className="self-start rounded-full border border-blue-600 px-5 py-2.5 active:bg-blue-50"
						>
							<Text className="font-bold text-blue-700 text-sm">Özel ders bilgisi</Text>
						</Pressable>
					</View>
				</View>

				<View className="px-5">
					<View className="gap-5 rounded-3xl bg-slate-900 p-6">
						<Text className="font-extrabold text-white text-xl leading-tight">
							Veliler için: çocuğunuz nerede eksik, görün
						</Text>
						<Text className="text-slate-300 leading-relaxed">
							Ücretsiz denemeyi çözen öğrencinin PDF analiz raporu hemen hazırlanır: yanlış yaptığı
							her soru çözümüyle, konu konu başarısı, izlemesi gereken dersler ve Çağlar Hoca'nın
							notu. İsterseniz raporu 15 dakikada birlikte değerlendiririz.
						</Text>

						<View className="gap-3 rounded-2xl bg-slate-800 p-4">
							<Text className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
								Örnek rapor · konu bazında başarı
							</Text>
							{SAMPLE_TOPICS.map((topic) => (
								<View key={topic.label} className="gap-1">
									<View className="flex-row justify-between">
										<Text className="text-slate-300 text-xs">{topic.label}</Text>
										<Text className="font-bold text-slate-100 text-xs">%{topic.value}</Text>
									</View>
									<View className="h-1.5 overflow-hidden rounded-full bg-slate-700">
										<View
											className="h-full rounded-full bg-blue-500"
											style={{ width: `${topic.value}%` }}
										/>
									</View>
								</View>
							))}
						</View>

						<View className="border-slate-700 border-l-2 pl-3">
							<Text className="text-slate-300 text-sm italic leading-relaxed">
								Öncelikle kareköklü ifadelere çalışalım: şu dersi izle → Kareköklü İfadelerde
								Sadeleştirme
							</Text>
						</View>

						<View className="gap-3">
							<Pressable
								onPress={() => router.push('/deneme-sinavlari')}
								className="flex-row items-center justify-center rounded-full bg-blue-600 py-3 active:bg-blue-700"
							>
								<Text className="font-bold text-sm text-white">Ücretsiz deneme çöz</Text>
							</Pressable>
							<Pressable
								onPress={() => router.push('/ozel-ders')}
								className="flex-row items-center justify-center rounded-full border border-slate-600 py-3 active:bg-slate-800"
							>
								<Text className="font-bold text-slate-100 text-sm">Deneme dersi için yazın</Text>
							</Pressable>
							<Pressable
								onPress={() =>
									void Linking.openURL('https://ketalearn.cloud/ornek-deneme-raporu.pdf')
								}
								className="flex-row items-center justify-center gap-2 py-1 active:opacity-70"
							>
								<FileText size={15} color="#93c5fd" />
								<Text className="font-semibold text-blue-300 text-sm">
									Örnek PDF raporu inceleyin
								</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</View>
		</ScrollView>
	);
}
