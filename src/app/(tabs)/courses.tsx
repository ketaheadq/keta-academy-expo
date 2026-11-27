import { useRouter } from 'expo-router';
import { BookOpen, SlidersHorizontal } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { CourseCard } from '@/components/shared/course-card';
import { Reveal } from '@/components/shared/motion';
import { EmptyState, LoadingState } from '@/components/shared/states';
import { getCourseProgress, getPublishedCourses, type StrapiCourse } from '@/lib/strapi';
import { useThemeColors } from '@/lib/theme';
import { cn, normalizeTurkish } from '@/lib/utils';
import { useJWT } from '@/stores/auth-store';

const ALL_GRADES = 'Tüm Sınıflar';
const ALL_SUBJECTS = 'Tüm Konular';

export default function CoursesScreen() {
	const router = useRouter();
	const colors = useThemeColors();
	const jwt = useJWT();
	const [courses, setCourses] = useState<StrapiCourse[]>([]);
	const [loading, setLoading] = useState(true);
	const [failed, setFailed] = useState(false);
	const [progress, setProgress] = useState<Record<string, number>>({});
	const [query, setQuery] = useState('');
	const [filtersOpen, setFiltersOpen] = useState(false);
	const [grade, setGrade] = useState(ALL_GRADES);
	const [subject, setSubject] = useState(ALL_SUBJECTS);

	const load = useCallback(() => {
		setLoading(true);
		setFailed(false);
		getPublishedCourses()
			.then((result) => {
				setCourses(result);
			})
			.catch(() => setFailed(true))
			.finally(() => setLoading(false));
	}, []);

	useEffect(load, [load]);

	useEffect(() => {
		let active = true;
		setProgress({});
		if (!jwt || !courses.length) return;
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
			if (active) setProgress(Object.fromEntries(entries.filter(Boolean) as [string, number][]));
		});
		return () => {
			active = false;
		};
	}, [jwt, courses]);

	const grades = useMemo(
		() => [...new Set(courses.flatMap((course) => (course.grades ?? []).map((g) => g.title)))],
		[courses],
	);
	const subjects = useMemo(
		() => [...new Set(courses.map((course) => course.subject?.title).filter(Boolean))],
		[courses],
	) as string[];

	const filtered = useMemo(() => {
		const needle = normalizeTurkish(query.trim());
		return courses.filter((course) => {
			if (grade !== ALL_GRADES && !(course.grades ?? []).some((g) => g.title === grade))
				return false;
			if (subject !== ALL_SUBJECTS && course.subject?.title !== subject) return false;
			if (!needle) return true;
			const haystack = normalizeTurkish(`${course.title} ${course.description}`);
			return haystack.includes(needle);
		});
	}, [courses, query, grade, subject]);

	if (loading) return <LoadingState label="Dersler yükleniyor..." />;

	return (
		<FlatList
			className="flex-1 bg-background"
			data={filtered}
			keyExtractor={(course) => course.documentId}
			contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
			ListHeaderComponent={
				<Reveal>
					<View className="mb-2 gap-3">
						<Text className="font-extrabold text-2xl text-foreground">Dersler</Text>
						<View className="flex-row items-center gap-2">
							<View className="flex-1 flex-row items-center rounded-xl border border-input bg-card px-3">
								<TextInput
									value={query}
									onChangeText={setQuery}
									placeholder="Ara..."
									placeholderTextColor={colors.mutedForeground}
									selectionColor={colors.primary}
									accessibilityLabel="Ders ara"
									className="h-11 flex-1 text-foreground text-sm"
								/>
							</View>
							<Pressable
								accessibilityRole="button"
								accessibilityLabel="Filtreler"
								accessibilityState={{ expanded: filtersOpen }}
								onPress={() => setFiltersOpen((open) => !open)}
								className={cn(
									'h-11 w-11 items-center justify-center rounded-xl border active:opacity-70',
									filtersOpen ? 'border-accent bg-accent/10' : 'border-input bg-card',
								)}
							>
								<SlidersHorizontal
									size={18}
									color={filtersOpen ? colors.primary : colors.mutedForeground}
								/>
							</Pressable>
						</View>

						{filtersOpen ? (
							<Reveal>
								<View className="gap-3 rounded-xl border border-border bg-card p-3">
									<FilterRow
										label="Sınıf"
										options={[ALL_GRADES, ...grades]}
										value={grade}
										onChange={setGrade}
									/>
									<FilterRow
										label="Konu"
										options={[ALL_SUBJECTS, ...subjects]}
										value={subject}
										onChange={setSubject}
									/>
								</View>
							</Reveal>
						) : null}
					</View>
				</Reveal>
			}
			ListEmptyComponent={
				failed ? (
					<EmptyState
						icon={BookOpen}
						title="Dersler yüklenemedi"
						description="Lütfen bağlantını kontrol edip tekrar dene."
						actionLabel="Tekrar Dene"
						onAction={load}
					/>
				) : (
					<EmptyState
						icon={BookOpen}
						title="Ders bulunamadı"
						description="Filtreleri değiştirerek dersleri bulabilirsiniz."
					/>
				)
			}
			renderItem={({ item }) => (
				<CourseCard
					course={item}
					hasJwt={!!jwt}
					progress={progress[item.documentId] ?? null}
					onPress={() => router.push(`/courses/${item.slug}`)}
				/>
			)}
		/>
	);
}

function FilterRow({
	label,
	options,
	value,
	onChange,
}: {
	label: string;
	options: string[];
	value: string;
	onChange: (next: string) => void;
}) {
	return (
		<View className="gap-2">
			<Text className="font-semibold text-muted-foreground text-xs uppercase tracking-wider">
				{label}
			</Text>
			<ScrollView
				horizontal
				accessibilityRole="radiogroup"
				accessibilityLabel={label}
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={{ gap: 8 }}
			>
				{options.map((option) => (
					<Pressable
						key={option}
						onPress={() => onChange(option)}
						accessibilityRole="radio"
						accessibilityState={{ checked: option === value }}
						aria-checked={option === value}
						className={cn(
							'rounded-full border px-3 py-1.5 active:opacity-70',
							option === value ? 'border-primary bg-primary' : 'border-input bg-card',
						)}
					>
						<Text
							className={cn(
								'font-medium text-xs',
								option === value ? 'text-primary-foreground' : 'text-foreground',
							)}
						>
							{option}
						</Text>
					</Pressable>
				))}
			</ScrollView>
		</View>
	);
}
