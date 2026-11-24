import { Calendar, Play, Star } from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';
import type { StrapiVideo } from '@/lib/strapi';
import { extractYouTubeVideoId, formatDateTR } from '@/lib/utils';

export function VideoCard({ video, onPress }: { video: StrapiVideo; onPress: () => void }) {
	const videoId = extractYouTubeVideoId(video.href);

	return (
		<Pressable
			onPress={onPress}
			className="mb-4 overflow-hidden rounded-2xl border border-slate-100 bg-white active:bg-slate-50"
		>
			{videoId ? (
				<View>
					<Image
						source={{ uri: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` }}
						className="h-44 w-full bg-slate-100"
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
						<View className="absolute top-2 right-2 flex-row items-center gap-1 rounded-full bg-blue-600 px-2.5 py-1">
							<Star size={11} color="#ffffff" />
							<Text className="font-medium text-white text-xs">Popüler</Text>
						</View>
					) : null}
				</View>
			) : (
				<View className="h-44 w-full items-center justify-center bg-slate-100">
					<Play size={28} color="#94a3b8" />
				</View>
			)}
			<View className="p-4">
				<Text className="font-bold text-base text-slate-900" numberOfLines={2}>
					{video.title}
				</Text>
				{video.page ? (
					<Text className="mt-1 text-slate-500 text-xs">
						<Text className="font-semibold">Sayfa:</Text> {video.page.title}
					</Text>
				) : null}
				<Pressable
					onPress={onPress}
					className="mt-3 flex-row items-center justify-center gap-2 rounded-full bg-blue-600 py-3 active:bg-blue-700"
				>
					<Play size={16} color="#ffffff" />
					<Text className="font-bold text-sm text-white">Videoyu İzle</Text>
				</Pressable>
			</View>
		</Pressable>
	);
}
