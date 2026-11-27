import { setStringAsync } from 'expo-clipboard';
import { Link } from 'expo-router';
import { Calendar, ChevronRight, Clock, Link2, Share2, User } from 'lucide-react-native';
import { Alert, Pressable, Share, Text, View } from 'react-native';
import { RichText } from '@/components/shared/rich-text';
import { SectionHeading } from '@/components/shared/states';
import type { StrapiBlog } from '@/lib/strapi';
import { useThemeColors } from '@/lib/theme';
import { extractTextFromBlocks, formatDateTR } from '@/lib/utils';

export function BlogArticle({ blog }: { blog: StrapiBlog }) {
	const colors = useThemeColors();
	const webUrl = `https://ketalearn.cloud/sayfalar/${blog.page?.slug ?? ''}/${blog.slug}`;
	const wordCount = extractTextFromBlocks(blog.content).split(/\s+/).filter(Boolean).length;
	const readingTime = Math.max(1, Math.ceil(wordCount / 200));

	const share = () => {
		Share.share({ message: `${blog.title} — ${webUrl}` }).catch(() => {});
	};

	const copyLink = async () => {
		await setStringAsync(webUrl);
		Alert.alert('Link kopyalandı', webUrl);
	};

	return (
		<View className="px-4 py-6">
			<Text className="text-center font-extrabold text-3xl text-foreground leading-tight">
				{blog.title}
			</Text>

			<View className="mt-4 flex-row flex-wrap justify-center gap-2">
				<View className="flex-row items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2">
					<Calendar size={14} color={colors.primary} />
					<Text className="font-medium text-muted-foreground text-xs">
						{formatDateTR(blog.publishedAt, true)}
					</Text>
				</View>
				<View className="flex-row items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2">
					<Clock size={14} color={colors.primary} />
					<Text className="font-medium text-muted-foreground text-xs">{readingTime} dk okuma</Text>
				</View>
				<View className="flex-row items-center gap-1.5 rounded-full border border-border bg-card px-3.5 py-2">
					<User size={14} color={colors.primary} />
					<Text className="font-medium text-muted-foreground text-xs">KetaLearn</Text>
				</View>
			</View>

			<View className="mt-4 flex-row justify-center gap-3">
				<Pressable
					onPress={share}
					className="flex-row items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 active:bg-muted"
				>
					<Share2 size={15} color={colors.primary} />
					<Text className="font-bold text-primary text-sm">Paylaş</Text>
				</Pressable>
				<Pressable
					onPress={() => void copyLink()}
					className="flex-row items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 active:bg-muted"
				>
					<Link2 size={15} color={colors.primary} />
					<Text className="font-bold text-primary text-sm">Linki Kopyala</Text>
				</Pressable>
			</View>

			<View className="mt-6 rounded-3xl border border-border bg-card p-5">
				<RichText blocks={blog.content} />
			</View>

			<View className="mt-6 items-center rounded-3xl bg-primary p-6">
				<Text className="text-center font-bold text-primary-foreground text-xl">
					Bu yazıyı beğendiniz mi?
				</Text>
				<Text className="mt-2 text-center text-primary-foreground/80 text-sm">
					Daha fazla eğitim içeriği için blog sayfamızı takip edin.
				</Text>
				<Pressable
					onPress={share}
					className="mt-4 flex-row items-center gap-2 rounded-full bg-card px-5 py-2.5 active:bg-accent/10"
				>
					<Share2 size={15} color={colors.primary} />
					<Text className="font-bold text-primary text-sm">Paylaş</Text>
				</Pressable>
			</View>

			{blog.related_datas?.length ? (
				<View className="mt-8">
					<SectionHeading title="İlgili Blog Yazıları" />
					{blog.related_datas.map((related) => (
						<Link
							key={related.id}
							href={`/sayfalar/${blog.page?.slug ?? ''}/${related.slug}`}
							asChild
						>
							<Pressable className="mb-2 flex-row items-center justify-between gap-2 rounded-xl border border-border bg-card p-4 active:bg-muted">
								<Text className="flex-1 font-medium text-foreground" numberOfLines={2}>
									{related.title}
								</Text>
								<ChevronRight size={18} color={colors.mutedForeground} />
							</Pressable>
						</Link>
					))}
				</View>
			) : null}
		</View>
	);
}
