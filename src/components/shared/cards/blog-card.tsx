import { Calendar, ExternalLink, FileText } from 'lucide-react-native';
import { Image, Pressable, Text, View } from 'react-native';
import { mediaUrl, type StrapiBlog } from '@/lib/strapi';
import { useThemeColors } from '@/lib/theme';
import { extractTextFromBlocks, formatDateTR } from '@/lib/utils';

export function BlogCard({ blog, onPress }: { blog: StrapiBlog; onPress: () => void }) {
	const colors = useThemeColors();
	const imageUri = mediaUrl(blog.image?.url);
	const preview =
		extractTextFromBlocks(blog.content)
			.split('\n\n')
			.map((paragraph) => paragraph.trim())
			.find(Boolean) ?? 'İçerik mevcut';

	return (
		<Pressable
			onPress={onPress}
			className="mb-4 overflow-hidden rounded-2xl border border-border bg-card active:bg-muted"
		>
			{imageUri ? (
				<View>
					<Image
						source={{ uri: imageUri }}
						className="h-44 w-full bg-muted"
						resizeMode="cover"
						accessibilityLabel={blog.image?.alternativeText || blog.title}
					/>
					<View className="absolute top-2 left-2 flex-row items-center gap-1 rounded-full bg-black/60 px-2.5 py-1">
						<Calendar size={11} color="#ffffff" />
						<Text className="font-medium text-white text-xs">{formatDateTR(blog.publishedAt)}</Text>
					</View>
					{blog.category ? (
						<View className="absolute top-2 right-2 rounded-full bg-primary px-2.5 py-1">
							<Text className="font-medium text-primary-foreground text-xs">{blog.category}</Text>
						</View>
					) : null}
				</View>
			) : (
				<View className="h-44 w-full items-center justify-center bg-muted">
					<FileText size={28} color={colors.mutedForeground} />
				</View>
			)}
			<View className="p-4">
				<Text className="font-bold text-base text-card-foreground" numberOfLines={2}>
					{blog.title}
				</Text>
				<Text className="mt-1 text-muted-foreground text-sm" numberOfLines={3}>
					{preview}
				</Text>
				<View className="mt-3 flex-row items-center justify-center gap-2 rounded-full bg-primary py-3">
					<ExternalLink size={16} color={colors.primaryForeground} />
					<Text className="font-bold text-primary-foreground text-sm">Yazıyı Oku</Text>
				</View>
			</View>
		</Pressable>
	);
}
