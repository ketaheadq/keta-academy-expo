import { BookOpen, Eye, Play, Share2, Target, Video as VideoIcon } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Image, Pressable, Share, Text, View } from 'react-native';
import { YouTubePlayer } from '@/components/shared/youtube-player';
import type { StrapiVideo } from '@/lib/strapi';
import { useThemeColors } from '@/lib/theme';
import { cn, extractYouTubeVideoId, formatDateTR } from '@/lib/utils';

function youtubeThumbnail(href: string): string | null {
	const id = extractYouTubeVideoId(href);
	return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
}

export function VideoPage({ video }: { video: StrapiVideo }) {
	const colors = useThemeColors();
	const allVideos = useMemo(() => [video, ...(video.related_datas ?? [])], [video]);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [loadedVideoId, setLoadedVideoId] = useState(video.id);

	// Reset to the main video when a different one is passed in.
	if (loadedVideoId !== video.id) {
		setLoadedVideoId(video.id);
		setCurrentIndex(0);
	}

	const current = allVideos[Math.min(currentIndex, allVideos.length - 1)] ?? video;
	const youtubeId = extractYouTubeVideoId(current.href);
	const currentThumb = youtubeThumbnail(current.href);
	const webUrl = `https://ketalearn.cloud/sayfalar/${video.page?.slug ?? ''}/${current.slug}`;

	const share = () => {
		Share.share({ message: `${current.title} — ${webUrl}` }).catch(() => {});
	};

	return (
		<View className="px-4 py-6">
			{youtubeId ? (
				<YouTubePlayer key={current.id} videoURL={current.href} />
			) : (
				<View className="h-52 items-center justify-center rounded-xl bg-slate-900 px-4">
					<Text className="font-semibold text-lg text-white">Video yüklenemedi</Text>
					<Text className="mt-2 text-center text-sm text-white/80">
						Video URL'si geçersiz: {current.href}
					</Text>
				</View>
			)}

			<Text className="mt-4 font-bold text-2xl text-foreground">{current.title}</Text>
			{current.isPopular ? (
				<View className="mt-2 self-start rounded-full bg-accent px-3 py-1">
					<Text className="font-semibold text-primary text-xs">Popüler</Text>
				</View>
			) : null}

			<View className="mt-4 flex-row items-center justify-between">
				<View className="flex-row gap-3">
					<Pressable
						onPress={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
						disabled={currentIndex === 0}
						className={cn(
							'rounded-full border px-5 py-2.5',
							currentIndex === 0
								? 'border-border bg-muted'
								: 'border-border bg-card active:bg-muted',
						)}
					>
						<Text
							className={cn(
								'font-bold text-sm',
								currentIndex === 0 ? 'text-muted-foreground' : 'text-foreground',
							)}
						>
							Önceki
						</Text>
					</Pressable>
					<Pressable
						onPress={() => setCurrentIndex((prev) => Math.min(allVideos.length - 1, prev + 1))}
						disabled={currentIndex === allVideos.length - 1}
						className={cn(
							'rounded-full border px-5 py-2.5',
							currentIndex === allVideos.length - 1
								? 'border-border bg-muted'
								: 'border-border bg-card active:bg-muted',
						)}
					>
						<Text
							className={cn(
								'font-bold text-sm',
								currentIndex === allVideos.length - 1 ? 'text-muted-foreground' : 'text-foreground',
							)}
						>
							Sonraki
						</Text>
					</Pressable>
				</View>
				<Pressable
					onPress={share}
					className="flex-row items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 active:bg-muted"
				>
					<Share2 size={15} color={colors.primary} />
					<Text className="font-bold text-primary text-sm">Paylaş</Text>
				</Pressable>
			</View>

			<View className="mt-6 rounded-2xl border border-border bg-card p-4">
				<View className="flex-row items-center gap-2">
					<BookOpen size={18} color={colors.primary} />
					<Text className="font-bold text-foreground text-lg">Bu Video Hakkında</Text>
				</View>
				<Text className="mt-3 font-semibold text-foreground text-sm">Video Açıklaması</Text>
				<Text className="mt-1 text-muted-foreground text-sm">{current.title}</Text>
				<View className="mt-3 gap-2">
					<View className="flex-row items-center gap-2">
						<Eye size={14} color={colors.mutedForeground} />
						<Text className="text-muted-foreground text-sm">
							Yayınlanma: {formatDateTR(current.publishedAt)}
						</Text>
					</View>
					{current.isPopular ? (
						<View className="flex-row items-center gap-2">
							<VideoIcon size={14} color={colors.primary} />
							<Text className="text-primary text-sm">Popüler İçerik</Text>
						</View>
					) : null}
					{current.page ? (
						<View className="flex-row items-center gap-2">
							<Target size={14} color={colors.mutedForeground} />
							<Text className="text-muted-foreground text-sm">Sayfa: {current.page.title}</Text>
						</View>
					) : null}
					{video.related_datas?.length ? (
						<View className="flex-row items-center gap-2">
							<BookOpen size={14} color={colors.mutedForeground} />
							<Text className="text-muted-foreground text-sm">
								{video.related_datas.length} İlgili Video
							</Text>
						</View>
					) : null}
				</View>
				{currentThumb ? (
					<Image
						source={{ uri: currentThumb }}
						className="mt-4 h-44 w-full rounded-xl bg-muted"
						resizeMode="cover"
						accessibilityLabel={current.title}
					/>
				) : (
					<View className="mt-4 h-44 w-full items-center justify-center rounded-xl bg-muted">
						<Play size={28} color={colors.mutedForeground} />
					</View>
				)}
			</View>

			<View className="mt-6 rounded-2xl border border-border bg-card p-4">
				<View className="flex-row items-center justify-between">
					<Text className="font-bold text-foreground text-lg">Videolar</Text>
					<View className="rounded-full bg-accent px-3 py-1">
						<Text className="font-semibold text-primary text-xs">{allVideos.length} Video</Text>
					</View>
				</View>
				<Text className="mt-1 text-muted-foreground text-sm">
					{video.related_datas?.length ? 'Ana video ve ilgili videolar' : 'Bu video'}
				</Text>
				<View className="mt-3 gap-2">
					{allVideos.map((videoItem, index) => {
						const thumb = youtubeThumbnail(videoItem.href);
						const isCurrent = current.id === videoItem.id;
						return (
							<Pressable
								key={videoItem.documentId}
								onPress={() => setCurrentIndex(index)}
								className={cn(
									'flex-row gap-3 rounded-xl border-2 p-3',
									isCurrent ? 'border-primary bg-accent' : 'border-transparent active:bg-muted',
								)}
							>
								<View className="h-12 w-16 shrink-0 justify-center overflow-hidden rounded-lg bg-muted">
									{thumb ? (
										<Image
											source={{ uri: thumb }}
											className="h-12 w-16"
											resizeMode="cover"
											accessibilityLabel={videoItem.title}
										/>
									) : null}
									<View className="absolute inset-0 items-center justify-center bg-black/50">
										<Play size={16} color="#ffffff" />
									</View>
								</View>
								<View className="flex-1">
									<View className="flex-row items-start justify-between gap-2">
										<Text className="flex-1 font-medium text-foreground text-sm" numberOfLines={2}>
											{videoItem.title}
										</Text>
										{videoItem.isPopular ? (
											<View className="rounded-full border border-border bg-card px-2 py-0.5">
												<Text className="font-medium text-muted-foreground text-xs">Popüler</Text>
											</View>
										) : null}
									</View>
									<Text className="mt-1 text-muted-foreground text-xs">
										{index === 0 ? 'Ana Video' : `İlgili Video ${index}`}
									</Text>
									<Text className="text-muted-foreground text-xs">
										{formatDateTR(videoItem.publishedAt)}
									</Text>
								</View>
							</Pressable>
						);
					})}
				</View>
			</View>
		</View>
	);
}
