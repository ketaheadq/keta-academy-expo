import { Link, Stack } from 'expo-router';
import { ChevronRight, Files } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
import { useAsync } from '@/hooks/use-async';
import { getPageCategories } from '@/lib/strapi';
import { useThemeColors } from '@/lib/theme';

export default function SayfalarScreen() {
	const { data, loading, error, reload } = useAsync(getPageCategories, []);
	const colors = useThemeColors();

	return (
		<View className="flex-1 bg-background">
			<Stack.Screen options={{ title: 'Tüm Sayfalar' }} />
			{loading ? (
				<LoadingState />
			) : error ? (
				<ErrorState message={error} onRetry={reload} />
			) : !data?.length ? (
				<EmptyState
					icon={Files}
					title="Sayfa bulunamadı"
					description="Henüz yayınlanmış sayfa yok."
				/>
			) : (
				<ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
					<Text className="mb-6 font-bold text-2xl text-foreground">Tüm Sayfalar</Text>
					<View className="gap-6">
						{data.map((category) => (
							<View key={category.id} className="rounded-2xl border border-border bg-card p-4">
								<Text className="mb-3 font-bold text-foreground text-lg">{category.title}</Text>
								<View className="gap-2">
									{category.pages.map((page) => (
										<Link key={page.id} href={`/sayfalar/${page.slug}`} asChild>
											<Pressable className="flex-row items-center justify-between gap-2 rounded-xl border border-input bg-card p-3 active:bg-muted">
												<View className="flex-1">
													<Text className="font-medium text-foreground">{page.title}</Text>
													<Text className="mt-1 text-muted-foreground text-sm">
														Tür: {page.pageType}
													</Text>
												</View>
												<ChevronRight size={18} color={colors.mutedForeground} />
											</Pressable>
										</Link>
									))}
								</View>
							</View>
						))}
					</View>
				</ScrollView>
			)}
		</View>
	);
}
