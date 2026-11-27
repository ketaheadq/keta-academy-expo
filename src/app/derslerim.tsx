import { Stack, useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { CourseCard } from '@/components/shared/course-card';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { useAsync } from '@/hooks/use-async';
import { withAppReturn } from '@/lib/routes';
import {
	getCourseProgress,
	getCoursesByDocumentIds,
	getMyCourses,
	type StrapiCourse,
} from '@/lib/strapi';
import { useJWT } from '@/stores/auth-store';

export default function DerslerimScreen() {
	const router = useRouter();
	const jwt = useJWT();

	const { data, loading, error, reload } = useAsync(async () => {
		if (!jwt) return { courses: [] as StrapiCourse[], progress: new Map<string, number>() };
		const mine = await getMyCourses(jwt);
		const courses = await getCoursesByDocumentIds(mine.map((item) => item.documentId));
		const progress = new Map<string, number>();
		await Promise.all(
			courses.map(async (course) => {
				const courseProgress = await getCourseProgress(course.documentId, jwt);
				const percentage =
					courseProgress.totalLessons > 0
						? (courseProgress.completedLessons / courseProgress.totalLessons) * 100
						: courseProgress.status === 'completed'
							? 100
							: 0;
				progress.set(
					course.documentId,
					percentage === 100 ? 100 : Math.min(Math.round(percentage), 99),
				);
			}),
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
						onAction={() => router.push(withAppReturn('/giris', '/derslerim'))}
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
