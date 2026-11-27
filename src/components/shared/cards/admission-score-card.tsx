import { Award, Calendar, FileText, TrendingUp, Users } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import type { StrapiAdmissionScore } from '@/lib/strapi';
import { useThemeColors } from '@/lib/theme';
import { formatDateTR } from '@/lib/utils';

export function AdmissionScoreCard({
	item,
	onPress,
}: {
	item: StrapiAdmissionScore;
	onPress: () => void;
}) {
	const colors = useThemeColors();
	const preview = item.content?.[0]?.children?.[0]?.text || 'Taban puanları ve detaylar mevcut';
	const relatedCount = item.related_datas?.length ?? 0;

	return (
		<Pressable
			onPress={onPress}
			className="mb-3 flex-row overflow-hidden rounded-2xl border border-border bg-card active:bg-muted"
		>
			<View className="w-20 items-center justify-center bg-primary px-2 py-4">
				<Award size={24} color={colors.accent} />
				<Text className="mt-1 text-center font-bold text-primary-foreground text-xs">
					{item.isPopular ? 'POPÜLER' : 'TABAN'}
				</Text>
			</View>
			<View className="flex-1 p-4">
				<Text className="font-bold text-base text-card-foreground" numberOfLines={2}>
					{item.title}
				</Text>
				<Text className="mt-1 text-muted-foreground text-sm" numberOfLines={2}>
					{preview}
				</Text>
				<View className="mt-2 flex-row items-center gap-3">
					<View className="flex-row items-center gap-1">
						<Calendar size={12} color={colors.mutedForeground} />
						<Text className="text-muted-foreground text-xs">{formatDateTR(item.publishedAt)}</Text>
					</View>
					<View className="flex-row items-center gap-1">
						<FileText size={12} color={colors.mutedForeground} />
						<Text className="text-muted-foreground text-xs">Veri Mevcut</Text>
					</View>
				</View>
				<View className="mt-3 flex-row items-center justify-between">
					{relatedCount > 0 ? (
						<View className="flex-row items-center gap-1">
							<Users size={12} color={colors.mutedForeground} />
							<Text className="text-muted-foreground text-xs">{relatedCount} ilgili veri</Text>
						</View>
					) : (
						<View />
					)}
					<View className="flex-row items-center gap-1 rounded-full bg-accent/10 px-4 py-2">
						<TrendingUp size={14} color={colors.accent} />
						<Text className="font-bold text-accent text-xs">Detayları Gör</Text>
					</View>
				</View>
			</View>
		</Pressable>
	);
}
