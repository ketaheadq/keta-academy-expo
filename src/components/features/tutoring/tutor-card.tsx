import { ArrowRight, User } from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';
import { TutorContactButtons } from '@/components/features/tutoring/tutor-contact-buttons';
import { RatingStars } from '@/components/shared/rating-stars';
import { mediaUrl, type StrapiTutoringProfile, type TutorRatingSummary } from '@/lib/strapi';
import { formatNumberTR } from '@/lib/utils';

function StatTile({ value, label }: { value: string; label: string }) {
	return (
		<View className="flex-1 items-center rounded-lg bg-blue-50 px-1 py-2">
			<Text className="font-bold text-blue-600 text-lg">{value}</Text>
			<Text className="text-slate-500 text-xs">{label}</Text>
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

	return (
		<Pressable
			onPress={onPress}
			className="overflow-hidden rounded-2xl border border-slate-200 bg-white active:bg-slate-50"
		>
			<View className="flex-row items-start gap-4 p-5 pb-4">
				{picture ? (
					<Image
						source={{ uri: picture }}
						className="size-16 rounded-full border-2 border-white bg-slate-100"
					/>
				) : (
					<View className="size-16 items-center justify-center rounded-full bg-slate-100">
						<User size={28} color="#64748b" />
					</View>
				)}
				<View className="min-w-0 flex-1">
					<Text className="font-bold text-slate-900 text-xl">{tutor.name}</Text>
					<Text className="mb-1.5 font-medium text-blue-600 text-sm">{tutor.title}</Text>
					<View className="flex-row flex-wrap items-center gap-2">
						{summary.count > 0 ? (
							<>
								<RatingStars rating={summary.average} />
								<Text className="font-semibold text-slate-900 text-sm">
									{formatNumberTR(summary.average)}
								</Text>
								<Text className="text-slate-500 text-sm">({summary.count})</Text>
							</>
						) : (
							<Text className="text-slate-500 text-sm">Henüz değerlendirme yok</Text>
						)}
					</View>
				</View>
			</View>

			{subjects.length > 0 ? (
				<View className="flex-row flex-wrap gap-2 px-5 pb-4">
					{subjects.slice(0, 3).map((subject) => (
						<View key={subject.slug} className="rounded-full bg-blue-50 px-2.5 py-1">
							<Text className="font-medium text-blue-600 text-xs">{subject.title}</Text>
						</View>
					))}
					{subjects.length > 3 ? (
						<View className="rounded-full bg-slate-100 px-2.5 py-1">
							<Text className="font-medium text-slate-500 text-xs">
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
					<Text className="font-bold text-2xl text-slate-900">
						₺{tutor.price}
						<Text className="font-normal text-slate-500 text-sm">/saat</Text>
					</Text>
					<View className="flex-row items-center gap-1">
						<Text className="font-medium text-blue-600 text-sm">Profili gör</Text>
						<ArrowRight size={16} color="#2563eb" />
					</View>
				</View>
				<TutorContactButtons tutor={tutor} fallbackPhone={fallbackPhone} compact />
			</View>
		</Pressable>
	);
}
