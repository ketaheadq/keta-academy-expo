import { Award, Calendar, FileText, TrendingUp, Users } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import type { StrapiAdmissionScore } from '@/lib/strapi';
import { formatDateTR } from '@/lib/utils';

export function AdmissionScoreCard({
	item,
	onPress,
}: {
	item: StrapiAdmissionScore;
	onPress: () => void;
}) {
	const preview = item.content?.[0]?.children?.[0]?.text || 'Taban puanları ve detaylar mevcut';
	const relatedCount = item.related_datas?.length ?? 0;

	return (
		<Pressable
			onPress={onPress}
			className="mb-3 flex-row overflow-hidden rounded-2xl border border-slate-100 bg-white active:bg-slate-50"
		>
			<View className="w-20 items-center justify-center bg-blue-600 px-2 py-4">
				<Award size={24} color="#ffffff" />
				<Text className="mt-1 text-center font-bold text-white text-xs">
					{item.isPopular ? 'POPÜLER' : 'TABAN'}
				</Text>
			</View>
			<View className="flex-1 p-4">
				<Text className="font-bold text-base text-slate-900" numberOfLines={2}>
					{item.title}
				</Text>
				<Text className="mt-1 text-slate-500 text-sm" numberOfLines={2}>
					{preview}
				</Text>
				<View className="mt-2 flex-row items-center gap-3">
					<View className="flex-row items-center gap-1">
						<Calendar size={12} color="#64748b" />
						<Text className="text-slate-500 text-xs">{formatDateTR(item.publishedAt)}</Text>
					</View>
					<View className="flex-row items-center gap-1">
						<FileText size={12} color="#64748b" />
						<Text className="text-slate-500 text-xs">Veri Mevcut</Text>
					</View>
				</View>
				<View className="mt-3 flex-row items-center justify-between">
					{relatedCount > 0 ? (
						<View className="flex-row items-center gap-1">
							<Users size={12} color="#64748b" />
							<Text className="text-slate-500 text-xs">{relatedCount} ilgili veri</Text>
						</View>
					) : (
						<View />
					)}
					<View className="flex-row items-center gap-1 rounded-full bg-blue-50 px-4 py-2">
						<TrendingUp size={14} color="#2563eb" />
						<Text className="font-bold text-blue-600 text-xs">Detayları Gör</Text>
					</View>
				</View>
			</View>
		</Pressable>
	);
}
