import { router, Stack, useLocalSearchParams } from 'expo-router';
import { FileText, GraduationCap, Search, Video } from 'lucide-react-native';
import { type ReactElement, type ReactNode, useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import { AdmissionScoreCard } from '@/components/shared/cards/admission-score-card';
import { BlogCard } from '@/components/shared/cards/blog-card';
import { VideoCard } from '@/components/shared/cards/video-card';
import { EmptyState, ErrorState, LoadingState, SectionHeading } from '@/components/shared/states';
import { useAsync } from '@/hooks/use-async';
import {
	getAdmissionScoresByPage,
	getBlogsByPage,
	getPageBySlug,
	getVideosByPage,
	type StrapiAdmissionScore,
	type StrapiBlog,
	type StrapiPage,
	type StrapiVideo,
} from '@/lib/strapi';
import { useThemeColors } from '@/lib/theme';
import { normalizeTurkish } from '@/lib/utils';

type ListingData =
	| { kind: 'admission'; page: StrapiPage; items: StrapiAdmissionScore[] }
	| { kind: 'video'; page: StrapiPage; items: StrapiVideo[] }
	| { kind: 'blog'; page: StrapiPage; items: StrapiBlog[] }
	| { kind: 'tools'; page: StrapiPage }
	| { kind: 'unknown'; page: StrapiPage }
	| null;

type ListableItem = { id: number; slug: string; title: string; isPopular: boolean };

function ItemListing<T extends ListableItem>({
	items,
	search,
	onSearchChange,
	popularTitle,
	fullTitle,
	emptyTitle,
	emptyDescription,
	emptyIcon,
	renderItem,
}: {
	items: T[];
	search: string;
	onSearchChange: (value: string) => void;
	popularTitle: string;
	fullTitle: string;
	emptyTitle: string;
	emptyDescription: string;
	emptyIcon?: typeof GraduationCap;
	renderItem: (item: T) => ReactElement;
}) {
	const colors = useThemeColors();
	const term = normalizeTurkish(search.trim());
	const filtered = term
		? items.filter((item) => normalizeTurkish(item.title).includes(term))
		: items;
	const popular = filtered.filter((item) => item.isPopular).slice(0, 3);
	const popularSet = new Set(popular);
	const rest = filtered.filter((item) => !popularSet.has(item));

	if (!items.length) {
		return <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />;
	}

	return (
		<FlatList
			data={rest}
			keyExtractor={(item) => String(item.id)}
			contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
			renderItem={({ item }) => renderItem(item)}
			ListHeaderComponent={
				<View>
					<View className="mb-4 flex-row items-center gap-2 rounded-full border border-input bg-card px-4 py-2.5">
						<Search size={16} color={colors.mutedForeground} />
						<TextInput
							accessibilityLabel="Liste içinde ara"
							value={search}
							onChangeText={onSearchChange}
							placeholder="Ara..."
							placeholderTextColor={colors.mutedForeground}
							className="flex-1 text-foreground text-sm"
						/>
					</View>
					{popular.length > 0 ? (
						<View className="mb-6">
							<SectionHeading title={popularTitle} />
							{popular.map((item) => (
								<View key={item.id}>{renderItem(item)}</View>
							))}
						</View>
					) : null}
					<SectionHeading title={fullTitle} />
				</View>
			}
			ListEmptyComponent={<EmptyState title={emptyTitle} description={emptyDescription} />}
		/>
	);
}

export default function SayfaListeScreen() {
	const { slug } = useLocalSearchParams<{ slug: string }>();
	const [search, setSearch] = useState('');

	const { data, loading, error, reload } = useAsync(async (): Promise<ListingData> => {
		const page = await getPageBySlug(slug);
		if (!page) return null;
		switch (page.pageType) {
			case 'Üniversite Taban Puanları':
			case 'Bölüm Taban Puanları':
				return { kind: 'admission', page, items: await getAdmissionScoresByPage(slug) };
			case 'Videolar':
				return { kind: 'video', page, items: await getVideosByPage(slug) };
			case 'Bloglar':
				return { kind: 'blog', page, items: await getBlogsByPage(slug) };
			case 'Hesaplama Araçları':
				return { kind: 'tools', page };
			default:
				return { kind: 'unknown', page };
		}
	}, [slug]);

	const openItem = (itemSlug: string) => {
		router.push(`/sayfalar/${slug}/${itemSlug}`);
	};

	let content: ReactNode;
	if (loading) {
		content = <LoadingState />;
	} else if (error) {
		content = <ErrorState message={error} onRetry={reload} />;
	} else if (!data) {
		content = (
			<EmptyState
				title="Sayfa bulunamadı"
				actionLabel="Tüm sayfalar"
				onAction={() => router.replace('/sayfalar')}
			/>
		);
	} else {
		switch (data.kind) {
			case 'admission':
				content = (
					<ItemListing
						items={data.items}
						search={search}
						onSearchChange={setSearch}
						popularTitle={`🔥 Popüler ${data.page.title} Taban Puanları`}
						fullTitle={`🎓 Tüm ${data.page.title} Taban Puanları`}
						emptyTitle="Taban puan bulunamadı"
						emptyDescription="Filtreleri değiştirerek taban puanları bulabilirsiniz."
						emptyIcon={GraduationCap}
						renderItem={(item) => (
							<AdmissionScoreCard item={item} onPress={() => openItem(item.slug)} />
						)}
					/>
				);
				break;
			case 'video':
				content = (
					<ItemListing
						items={data.items}
						search={search}
						onSearchChange={setSearch}
						popularTitle={`🔥 Popüler ${data.page.title} Videolar`}
						fullTitle={`Tüm ${data.page.title} Videolar`}
						emptyTitle="Video bulunamadı"
						emptyDescription="Aradığınız kriterlere uygun video bulunamadı."
						emptyIcon={Video}
						renderItem={(item) => <VideoCard video={item} onPress={() => openItem(item.slug)} />}
					/>
				);
				break;
			case 'blog':
				content = (
					<ItemListing
						items={data.items}
						search={search}
						onSearchChange={setSearch}
						popularTitle={`🔥 Popüler ${data.page.title} Blog Yazıları`}
						fullTitle={`Tüm ${data.page.title} Blog Yazıları`}
						emptyTitle="Blog yazısı bulunamadı"
						emptyDescription="Aradığınız kriterlere uygun blog yazısı bulunamadı."
						emptyIcon={FileText}
						renderItem={(item) => <BlogCard blog={item} onPress={() => openItem(item.slug)} />}
					/>
				);
				break;
			case 'tools':
				content = (
					<View className="items-center px-6 py-16">
						<Text className="font-bold text-foreground text-xl">Hesaplama Araçları</Text>
						<Text className="mt-2 text-center text-muted-foreground">
							Calculation tools will be implemented here
						</Text>
					</View>
				);
				break;
			default:
				content = (
					<View className="items-center px-6 py-16">
						<Text className="text-center text-lg text-muted-foreground">Sayfa yüklenemedi.</Text>
					</View>
				);
		}
	}

	return (
		<View className="flex-1 bg-background">
			<Stack.Screen options={{ title: data?.page.title ?? 'Sayfalar' }} />
			{content}
		</View>
	);
}
