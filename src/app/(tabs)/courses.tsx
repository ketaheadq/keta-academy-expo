import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Text, View } from 'react-native';
import { type CourseProgress, getCourseProgress, getCourses } from '@/lib/strapi';
import { useJWT } from '@/stores/auth-store';

interface Course {
	documentId: string;
	title: string;
	description: string;
	progress?: CourseProgress;
}

export default function CoursesScreen() {
	const jwt = useJWT();
	const [courses, setCourses] = useState<Course[]>([]);
	const [loading, setLoading] = useState(true);
	const [failed, setFailed] = useState(false);

	useFocusEffect(useCallback(() => {
		let active = true;
		setLoading(true);
		setFailed(false);
		async function loadCourses() {
			try {
				const catalog: Course[] = await getCourses();
				const results = jwt
					? await Promise.all(catalog.map(async course => ({
						...course, progress: await getCourseProgress(course.documentId, jwt),
					})))
					: catalog;
				if (active) setCourses(results);
			} catch {
				if (active) setFailed(true);
			} finally {
				if (active) setLoading(false);
			}
		}
		void loadCourses();
		return () => { active = false; };
	}, [jwt]));

	if (loading) return <ActivityIndicator className="mt-8" />;
	if (failed) return <Text className="p-4 text-foreground">Kurslar yüklenemedi.</Text>;

	return (
		<FlatList
			className="bg-background"
			data={courses}
			keyExtractor={course => course.documentId}
			contentContainerStyle={{ padding: 16, gap: 12 }}
			ListEmptyComponent={<Text className="text-foreground">Henüz yayınlanmış kurs yok.</Text>}
			renderItem={({ item }) => (
				<View className="gap-2 rounded-xl border border-border bg-card p-4">
					<Text className="font-bold text-foreground text-lg">{item.title}</Text>
					<Text className="text-muted-foreground">{item.description}</Text>
					{item.progress && (
						<Text className="text-foreground">
							{item.progress.completedLessons} / {item.progress.totalLessons} ders tamamlandı
						</Text>
					)}
					{item.progress?.lastQuizPercentage != null && (
						<Text className="text-foreground">Son quiz %{Math.round(item.progress.lastQuizPercentage)}</Text>
					)}
				</View>
			)}
		/>
	);
}
