import { useRouter } from 'expo-router';
import { BookText } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Text, TextInput, View } from 'react-native';
import { BlogCard } from '@/components/shared/cards/blog-card';
import { EmptyState, LoadingState } from '@/components/shared/states';
import { getBlogs, type StrapiBlog } from '@/lib/strapi';
import { useThemeColors } from '@/lib/theme';
import { normalizeTurkish } from '@/lib/utils';

export default function BlogScreen() {
	const router = useRouter();
	const colors = useThemeColors();
	const [blogs, setBlogs] = useState<StrapiBlog[]>([]);
	const [loading, setLoading] = useState(true);
	const [failed, setFailed] = useState(false);
	const [query, setQuery] = useState('');

	const load = useCallback(() => {
		setLoading(true);
		setFailed(false);
		getBlogs()
			.then((result) => {
				setBlogs(result);
				setFailed(false);
			})
			.catch(() => setFailed(true))
			.finally(() => setLoading(false));
	}, []);

	useEffect(load, [load]);

	const filtered = useMemo(() => {
		const needle = normalizeTurkish(query.trim());
		if (!needle) return blogs;
		return blogs.filter((blog) =>
			normalizeTurkish(`${blog.title} ${blog.category ?? ''}`).includes(needle),
		);
	}, [blogs, query]);

	if (loading) return <LoadingState label="Blog yazıları yükleniyor..." />;

	return (
		<FlatList
			className="flex-1 bg-background"
			data={filtered}
			keyExtractor={(blog) => blog.documentId}
			contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}
			ListHeaderComponent={
				<View className="mb-2 gap-3">
					<Text className="font-extrabold text-2xl text-foreground">Blog</Text>
					<View className="flex-row items-center rounded-xl border border-input bg-card px-3">
						<TextInput
							accessibilityLabel="Blog yazılarında ara"
							value={query}
							onChangeText={setQuery}
							placeholder="Ara..."
							placeholderTextColor={colors.mutedForeground}
							className="h-11 flex-1 text-foreground text-sm"
						/>
					</View>
				</View>
			}
			ListEmptyComponent={
				failed ? (
					<EmptyState
						icon={BookText}
						title="Blog yazıları yüklenemedi"
						description="Lütfen bağlantını kontrol edip tekrar dene."
						actionLabel="Tekrar Dene"
						onAction={load}
					/>
				) : (
					<EmptyState
						icon={BookText}
						title="Blog yazısı bulunamadı"
						description="Aradığınız kriterlere uygun blog yazısı bulunamadı."
					/>
				)
			}
			renderItem={({ item }) => (
				<BlogCard
					blog={item}
					onPress={() => {
						const pageSlug = item.page?.slug;
						if (pageSlug) router.push(`/sayfalar/${pageSlug}/${item.slug}`);
						else router.push('/sayfalar');
					}}
				/>
			)}
		/>
	);
}
