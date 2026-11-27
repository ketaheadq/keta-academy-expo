import { Link, router, Stack, useLocalSearchParams } from 'expo-router';
import { ChevronDown, ChevronRight, ChevronUp, School } from 'lucide-react-native';
import { type ReactNode, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AdmissionScoreTable } from '@/components/features/admission/admission-score-table';
import { BlogArticle } from '@/components/features/blog/blog-article';
import { VideoPage } from '@/components/features/video/video-page';
import { RichText } from '@/components/shared/rich-text';
import { EmptyState, ErrorState, LoadingState, SectionHeading } from '@/components/shared/states';
import { useAsync } from '@/hooks/use-async';
import {
	getAdmissionScoreBySlug,
	getAdmissionScoreTableDataBySlug,
	getBlogBySlug,
	getPageBySlug,
	getVideoBySlug,
	type StrapiAdmissionScore,
	type StrapiBlock,
	type StrapiBlog,
	type StrapiPage,
	type StrapiVideo,
} from '@/lib/strapi';
import { useThemeColors } from '@/lib/theme';

type DetailData =
	| { kind: 'missing-page' }
	| {
			kind: 'admission';
			page: StrapiPage;
			item: StrapiAdmissionScore | null;
			tableData: string | null;
	  }
	| { kind: 'video'; page: StrapiPage; item: StrapiVideo | null }
	| { kind: 'blog'; page: StrapiPage; item: StrapiBlog | null }
	| { kind: 'unsupported'; page: StrapiPage };

function buildPreviewBlocks(blocks: StrapiBlock[]): StrapiBlock[] {
	const preview: StrapiBlock[] = [];
	for (const block of blocks) {
		if (block.type !== 'paragraph') {
			preview.push(block);
			continue;
		}
		const firstTextChild = block.children?.find((child) => child.text?.trim());
		const text = firstTextChild?.text ?? '';
		const match = /[.!?]+/.exec(text);
		if (firstTextChild && match && match.index < text.length - 1) {
			const truncated = text.slice(0, match.index + 1);
			preview.push({
				...block,
				children: block.children.map((child) =>
					child === firstTextChild ? { ...child, text: truncated } : child,
				),
			});
		} else {
			preview.push(block);
		}
		return preview;
	}
	return preview;
}

function ExpandableDetailsCard({ title, blocks }: { title: string; blocks: StrapiBlock[] }) {
	const [expanded, setExpanded] = useState(false);
	const colors = useThemeColors();
	const preview = useMemo(() => buildPreviewBlocks(blocks), [blocks]);
	const hasMore = JSON.stringify(preview) !== JSON.stringify(blocks);

	return (
		<View className="mb-6 rounded-2xl border border-border bg-card p-4">
			<View className="mb-2 flex-row items-center gap-2">
				<School size={18} color={colors.primary} />
				<Text className="font-bold text-card-foreground text-lg">{title}</Text>
			</View>
			<RichText blocks={expanded ? blocks : preview} />
			{hasMore ? (
				<Pressable
					accessibilityState={{ expanded }}
					onPress={() => setExpanded((prev) => !prev)}
					className="mt-3 flex-row items-center gap-1 self-start active:opacity-70"
				>
					<Text className="font-bold text-primary text-sm">
						{expanded ? 'Daha Az Göster' : 'Devamını Oku'}
					</Text>
					{expanded ? (
						<ChevronUp size={16} color={colors.primary} />
					) : (
						<ChevronDown size={16} color={colors.primary} />
					)}
				</Pressable>
			) : null}
		</View>
	);
}

export default function SayfaDetayScreen() {
	const { slug, subSlug } = useLocalSearchParams<{ slug: string; subSlug: string }>();
	const colors = useThemeColors();

	const { data, loading, error, reload } = useAsync(async (): Promise<DetailData> => {
		const page = await getPageBySlug(slug);
		if (!page) return { kind: 'missing-page' };
		switch (page.pageType) {
			case 'Üniversite Taban Puanları':
			case 'Bölüm Taban Puanları': {
				const [item, tableData] = await Promise.all([
					getAdmissionScoreBySlug(subSlug),
					getAdmissionScoreTableDataBySlug(subSlug),
				]);
				return { kind: 'admission', page, item, tableData };
			}
			case 'Videolar':
				return { kind: 'video', page, item: await getVideoBySlug(subSlug) };
			case 'Bloglar':
				return { kind: 'blog', page, item: await getBlogBySlug(subSlug) };
			default:
				return { kind: 'unsupported', page };
		}
	}, [slug, subSlug]);

	let headerTitle = 'Sayfa';
	let content: ReactNode;

	if (loading) {
		content = <LoadingState />;
	} else if (error) {
		content = <ErrorState message={error} onRetry={reload} />;
	} else if (!data || data.kind === 'missing-page') {
		content = (
			<EmptyState
				title="Sayfa bulunamadı"
				actionLabel="Tüm sayfalar"
				onAction={() => router.replace('/sayfalar')}
			/>
		);
	} else if (data.kind === 'unsupported') {
		headerTitle = data.page.title;
		content = (
			<View className="items-center px-6 py-16">
				<Text className="text-center font-bold text-foreground text-lg">
					Desteklenmeyen sayfa türü
				</Text>
			</View>
		);
	} else if (data.kind === 'admission') {
		headerTitle = data.item?.title ?? data.page.title;
		if (!data.item) {
			content = (
				<ErrorState
					message={`${data.page.pageType} verisi yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.`}
					onRetry={reload}
				/>
			);
		} else {
			const item = data.item;
			const detailsTitle = item.university
				? 'Okul Detayları'
				: item.department
					? 'Bölüm Detayları'
					: 'Genel Detaylar';
			const detailsBlocks =
				item.university?.content ?? item.department?.content ?? item.content ?? [];
			content = (
				<ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
					{detailsBlocks.length > 0 ? (
						<ExpandableDetailsCard title={detailsTitle} blocks={detailsBlocks} />
					) : null}
					<AdmissionScoreTable title={item.title} csv={data.tableData} />
					{item.related_datas?.length ? (
						<View className="mt-8">
							<SectionHeading title="İlgili Sayfalar" />
							{item.related_datas.map((related) => (
								<Link key={related.id} href={`/sayfalar/${slug}/${related.slug}`} asChild>
									<Pressable className="mb-2 flex-row items-center justify-between gap-2 rounded-xl border border-input bg-card p-4 active:bg-muted">
										<Text className="flex-1 font-medium text-foreground" numberOfLines={2}>
											{related.title}
										</Text>
										<ChevronRight size={18} color={colors.mutedForeground} />
									</Pressable>
								</Link>
							))}
						</View>
					) : null}
				</ScrollView>
			);
		}
	} else if (data.kind === 'video') {
		headerTitle = data.item?.title ?? data.page.title;
		content = data.item ? (
			<ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
				<VideoPage video={data.item} />
			</ScrollView>
		) : (
			<ErrorState
				message="Video verisi yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
				onRetry={reload}
			/>
		);
	} else {
		headerTitle = data.item?.title ?? data.page.title;
		content = data.item ? (
			<ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
				<BlogArticle blog={data.item} />
			</ScrollView>
		) : (
			<ErrorState
				message="Blog verisi yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin."
				onRetry={reload}
			/>
		);
	}

	return (
		<View className="flex-1 bg-background">
			<Stack.Screen options={{ title: headerTitle }} />
			{content}
		</View>
	);
}
