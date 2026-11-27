import { Calendar, Play, Star } from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';
import type { StrapiVideo } from '@/lib/strapi';
import { useThemeColors } from '@/lib/theme';
import { extractYouTubeVideoId, formatDateTR } from '@/lib/utils';

export function VideoCard({ video, onPress }: { video: StrapiVideo; onPress: () => void }) {
	const colors = useThemeColors();
	const videoId = extractYouTubeVideoId(video.href);

	return (
		<Pressable
			onPress={onPress}
			className="mb-4 overflow-hidden rounded-2xl border border-border bg-card active:bg-muted"
		>
			{videoId ? (
				<View>
					<Image
						source={{ uri: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` }}
						className="h-44 w-full bg-muted"
						resizeMode="cover"
						accessibilityLabel={video.title}
					/>
					<View className="absolute top-2 left-2 flex-row items-center gap-1 rounded-full bg-black/60 px-2.5 py-1">
						<Calendar size={11} color="#ffffff" />
						<Text className="font-medium text-white text-xs">
							{formatDateTR(video.publishedAt)}
						</Text>
					</View>
					{video.isPopular ? (
						<View className="absolute top-2 right-2 flex-row items-center gap-1 rounded-full bg-primary px-2.5 py-1">
							<Star size={11} color={colors.primaryForeground} />
							<Text className="font-medium text-primary-foreground text-xs">Popüler</Text>
						</View>
					) : null}
				</View>
			) : (
				<View className="h-44 w-full items-center justify-center bg-muted">
					<Play size={28} color={colors.mutedForeground} />
				</View>
			)}
			<View className="p-4">
				<Text className="font-bold text-base text-card-foreground" numberOfLines={2}>
					{video.title}
				</Text>
				{video.page ? (
					<Text className="mt-1 text-muted-foreground text-xs">
						<Text className="font-semibold">Sayfa:</Text> {video.page.title}
					</Text>
				) : null}
				<View className="mt-3 flex-row items-center justify-center gap-2 rounded-full bg-primary py-3">
					<Play size={16} color={colors.primaryForeground} />
					<Text className="font-bold text-primary-foreground text-sm">Videoyu İzle</Text>
				</View>
			</View>
		</Pressable>
	);
}
