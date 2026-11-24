import { Stack, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { CourseCard } from '@/components/shared/course-card';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { useAsync } from '@/hooks/use-async';
import {
	type CourseStatus,
	getCoursesByDocumentIds,
	getMyCourses,
	getUserLessonProgress,
	type StrapiCourse,
} from '@/lib/strapi';
import { useJWT } from '@/stores/auth-store';

function courseProgressPercent(
	course: StrapiCourse,
	completedIds: Set<string>,
	status: CourseStatus,
): number {
	// `populate=*` may leave the nested lesson unpopulated; fall back to the course status then.
	const lessonIds = (course.course_lessons ?? [])
		.map((link) => link.lesson?.documentId)
		.filter((id): id is string => typeof id === 'string');
	if (!lessonIds.length) {
		return status === 'completed' ? 100 : status === 'in_progress' ? 50 : 0;
	}
	const done = lessonIds.filter((id) => completedIds.has(id)).length;
	if (done === lessonIds.length) return 100;
	return Math.min(Math.round((done / lessonIds.length) * 100), 99);
}

export default function DerslerimScreen() {
	const router = useRouter();
	const jwt = useJWT();

	const { data, loading, error, reload } = useAsync(async () => {
		if (!jwt) return { courses: [] as StrapiCourse[], progress: new Map<string, number>() };
		const mine = await getMyCourses(jwt);
		const [courses, rows] = await Promise.all([
			getCoursesByDocumentIds(mine.map((item) => item.documentId)),
			getUserLessonProgress(undefined, jwt),
		]);
		const completedIds = new Set(
			rows.filter((row) => row.isCompleted).map((row) => row.documentId),
		);
		const statusById = new Map(mine.map((item) => [item.documentId, item.status]));
		const progress = new Map(
			courses.map((course) => [
				course.documentId,
				courseProgressPercent(
					course,
					completedIds,
					statusById.get(course.documentId) ?? 'not_started',
				),
			]),
		);
		return { courses, progress };
	}, [jwt]);

	return (
		<>
			<Stack.Screen options={{ title: 'Derslerim' }} />
			{!jwt ? (
				<View className="flex-1 justify-center bg-slate-50">
					<EmptyState
						title="Derslerinizi görmek için giriş yapmanız gerekiyor."
						actionLabel="Giriş Yap"
						onAction={() => router.push('/giris')}
					/>
				</View>
			) : loading ? (
				<LoadingState label="Dersleriniz yükleniyor..." />
			) : error ? (
				<ErrorState message="Veriler yüklenirken bir hata oluştu" onRetry={reload} />
			) : (
				<ScrollView className="flex-1 bg-slate-50">
					<View className="gap-4 p-4">
						<Text className="text-center text-lg text-slate-600">
							Başladığın derslerin ve ilerleme durumun
						</Text>
						{data && data.courses.length > 0 ? (
							data.courses.map((course) => (
								<CourseCard
									key={course.documentId}
									course={course}
									progress={data.progress.get(course.documentId) ?? null}
									hasJwt
									onPress={() => router.push(`/courses/${course.slug}`)}
								/>
							))
						) : (
							<EmptyState
								title="Henüz ders başlatmadınız"
								description="İlk dersinizi başlatmak için konular sayfasına gidin."
								actionLabel="Dersleri Keşfet"
								onAction={() => router.push('/courses')}
							/>
						)}
					</View>
				</ScrollView>
			)}
		</>
	);
}
