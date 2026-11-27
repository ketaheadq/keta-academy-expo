import { ArrowRight, User } from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';
import { TutorContactButtons } from '@/components/features/tutoring/tutor-contact-buttons';
import { RatingStars } from '@/components/shared/rating-stars';
import { mediaUrl, type StrapiTutoringProfile, type TutorRatingSummary } from '@/lib/strapi';
import { useThemeColors } from '@/lib/theme';
import { formatNumberTR } from '@/lib/utils';

function StatTile({ value, label }: { value: string; label: string }) {
	return (
		<View className="flex-1 items-center rounded-lg bg-accent px-1 py-2">
			<Text className="font-bold text-lg text-primary">{value}</Text>
			<Text className="text-muted-foreground text-xs">{label}</Text>
		</View>
	);
}

export function TutorCard({
	tutor,
	summary,
	fallbackPhone = null,
	onPress,
}: {
	tutor: StrapiTutoringProfile;
	summary: TutorRatingSummary;
	fallbackPhone?: string | null;
	onPress: () => void;
}) {
	const subjects = tutor.subjects ?? [];
	const picture = mediaUrl(tutor.profilePicture?.url);
	const colors = useThemeColors();

	return (
		<Pressable
			onPress={onPress}
			className="overflow-hidden rounded-2xl border border-border bg-card active:bg-muted"
		>
			<View className="flex-row items-start gap-4 p-5 pb-4">
				{picture ? (
					<Image
						source={{ uri: picture }}
						className="size-16 rounded-full border-2 border-card bg-muted"
					/>
				) : (
					<View className="size-16 items-center justify-center rounded-full bg-muted">
						<User size={28} color={colors.mutedForeground} />
					</View>
				)}
				<View className="min-w-0 flex-1">
					<Text className="font-bold text-foreground text-xl">{tutor.name}</Text>
					<Text className="mb-1.5 font-medium text-primary text-sm">{tutor.title}</Text>
					<View className="flex-row flex-wrap items-center gap-2">
						{summary.count > 0 ? (
							<>
								<RatingStars rating={summary.average} />
								<Text className="font-semibold text-foreground text-sm">
									{formatNumberTR(summary.average)}
								</Text>
								<Text className="text-muted-foreground text-sm">({summary.count})</Text>
							</>
						) : (
							<Text className="text-muted-foreground text-sm">Henüz değerlendirme yok</Text>
						)}
					</View>
				</View>
			</View>

			{subjects.length > 0 ? (
				<View className="flex-row flex-wrap gap-2 px-5 pb-4">
					{subjects.slice(0, 3).map((subject) => (
						<View key={subject.slug} className="rounded-full bg-accent px-2.5 py-1">
							<Text className="font-medium text-primary text-xs">{subject.title}</Text>
						</View>
					))}
					{subjects.length > 3 ? (
						<View className="rounded-full bg-muted px-2.5 py-1">
							<Text className="font-medium text-muted-foreground text-xs">
								+{subjects.length - 3} daha
							</Text>
						</View>
					) : null}
				</View>
			) : null}

			<View className="flex-row gap-2 px-5 pb-4">
				<StatTile
					value={summary.satisfaction !== null ? `%${summary.satisfaction}` : '—'}
					label="Memnuniyet"
				/>
				<StatTile value={`${tutor.studentCount}`} label="Öğrenci" />
				<StatTile value={`${tutor.exprienceYears}`} label="Yıl Deneyim" />
			</View>

			<View className="px-5 pb-5">
				<View className="mb-3 flex-row items-center justify-between">
					<Text className="font-bold text-2xl text-foreground">
						₺{tutor.price}
						<Text className="font-normal text-muted-foreground text-sm">/saat</Text>
					</Text>
					<View className="flex-row items-center gap-1">
						<Text className="font-medium text-primary text-sm">Profili gör</Text>
						<ArrowRight size={16} color={colors.primary} />
					</View>
				</View>
				<TutorContactButtons tutor={tutor} fallbackPhone={fallbackPhone} compact />
			</View>
		</Pressable>
	);
}
