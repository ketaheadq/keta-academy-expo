import { BookOpen, CheckCircle2, Clock } from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';
import { AnimatedProgress, Reveal } from '@/components/shared/motion';
import { getCourseIcon } from '@/lib/icons';
import { mediaUrl, type StrapiCourse } from '@/lib/strapi';
import { useThemeColors } from '@/lib/theme';
import { cn } from '@/lib/utils';

/** Button label logic matches the web `CourseCard`. */
export function courseButtonLabel(progress: number | null, hasJwt: boolean): string {
	if (progress === 100) return 'Bitti';
	if (progress && progress > 0) return 'Devam Et';
	if (hasJwt && progress === null) return 'Kursu Aç';
	return 'Kursa Başla';
}

export function CourseCard({
	course,
	progress,
	hasJwt,
	onPress,
	className,
}: {
	course: StrapiCourse;
	/** 0-100, or null when progress hasn't loaded / the user is signed out. */
	progress?: number | null;
	hasJwt?: boolean;
	onPress?: () => void;
	className?: string;
}) {
	const cover = mediaUrl(course.thumbnail?.url) ?? mediaUrl(course.image?.url);
	const Icon = getCourseIcon(course.icon?.name);
	const grades = (course.grades ?? []).map((grade) => grade.title).join(', ');
	const lessonCount = course.course_lessons?.length ?? 0;
	const done = progress === 100;
	const colors = useThemeColors();

	return (
		<Reveal>
			<Pressable
				onPress={onPress}
				accessibilityRole="button"
				accessibilityLabel={`${course.title}. ${courseButtonLabel(progress ?? null, !!hasJwt)}`}
				className={cn(
					'overflow-hidden rounded-2xl border border-border bg-card shadow-black/5 shadow-sm active:bg-muted',
					className,
				)}
			>
				{cover ? (
					<Image
						source={{ uri: cover }}
						accessibilityLabel={course.thumbnail?.alternativeText ?? course.title}
						resizeMode="cover"
						style={{ width: '100%', height: 150 }}
					/>
				) : (
					<View className="h-32 w-full items-center justify-center bg-accent">
						<Icon size={40} color={colors.primary} />
					</View>
				)}

				<View className="gap-2 p-4">
					<View className="flex-row flex-wrap gap-1.5">
						{grades ? <Badge label={grades} /> : null}
						{course.subject?.title ? <Badge label={course.subject.title} tone="blue" /> : null}
					</View>

					<Text className="font-bold text-foreground text-lg leading-tight" numberOfLines={2}>
						{course.title}
					</Text>
					<Text className="text-muted-foreground text-sm" numberOfLines={2}>
						{course.description}
					</Text>

					<View className="mt-1 flex-row items-center gap-4">
						<View className="flex-row items-center gap-1">
							<Clock size={14} color={colors.mutedForeground} />
							<Text className="text-muted-foreground text-xs">
								{course.duration ? `${course.duration} dk` : 'Kendi hızında'}
							</Text>
						</View>
						<View className="flex-row items-center gap-1">
							<BookOpen size={14} color={colors.mutedForeground} />
							<Text className="text-muted-foreground text-xs">{lessonCount} ders</Text>
						</View>
					</View>

					{progress && progress > 0 ? (
						<View className="mt-2 gap-1">
							<View className="flex-row items-center justify-between">
								<Text className="text-muted-foreground text-xs">İlerleme</Text>
								<Text className="font-semibold text-foreground text-xs">{progress}%</Text>
							</View>
							<AnimatedProgress
								progress={progress}
								tone={done ? 'success' : 'primary'}
								accessibilityLabel={`${course.title} ilerlemesi`}
							/>
						</View>
					) : null}

					<View
						className={cn(
							'mt-3 flex-row items-center justify-center rounded-xl py-2.5',
							done ? 'bg-success/10' : 'bg-accent',
						)}
					>
						{done ? <CheckCircle2 size={16} color={colors.success} /> : null}
						<Text
							className={cn('font-bold text-sm', done ? 'ml-1.5 text-success' : 'text-primary')}
						>
							{courseButtonLabel(progress ?? null, !!hasJwt)}
						</Text>
					</View>
				</View>
			</Pressable>
		</Reveal>
	);
}

function Badge({ label, tone = 'slate' }: { label: string; tone?: 'slate' | 'blue' }) {
	return (
		<View className={cn('rounded-full px-2.5 py-1', tone === 'blue' ? 'bg-accent' : 'bg-muted')}>
			<Text
				className={cn(
					'font-semibold text-xs',
					tone === 'blue' ? 'text-primary' : 'text-muted-foreground',
				)}
			>
				{label}
			</Text>
		</View>
	);
}
