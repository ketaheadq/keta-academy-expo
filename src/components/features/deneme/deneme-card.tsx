import { ArrowRight, Clock, FileQuestion, Users } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { type DenemeSummary, SINAV_TURU_LABEL } from '@/lib/deneme';
import { cn, formatNumberTR } from '@/lib/utils';

/** Exam card for the exam list; the whole card taps through to the exam runner. */
export function DenemeCard({ deneme, onPress }: { deneme: DenemeSummary; onPress: () => void }) {
	return (
		<Pressable
			onPress={onPress}
			className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm active:bg-slate-50"
		>
			<View className="mb-3 flex-row flex-wrap gap-2">
				<Badge label={SINAV_TURU_LABEL[deneme.sinavTuru]} tone="blue" />
				{deneme.sinif ? <Badge label={deneme.sinif.title} /> : null}
				{deneme.ders ? <Badge label={deneme.ders.title} tone="outline" /> : null}
			</View>

			<Text className="font-bold text-lg text-slate-900 leading-snug">{deneme.baslik}</Text>
			{deneme.aciklama ? (
				<Text className="mt-2 text-slate-500 text-sm" numberOfLines={2}>
					{deneme.aciklama}
				</Text>
			) : null}

			<View className="mt-4 flex-row flex-wrap items-center gap-3">
				<View className="flex-row items-center gap-1">
					<FileQuestion size={14} color="#64748b" />
					<Text className="text-slate-500 text-xs">{deneme.soruSayisi} soru</Text>
				</View>
				<View className="flex-row items-center gap-1">
					<Clock size={14} color="#64748b" />
					<Text className="text-slate-500 text-xs">{deneme.sureDakika} dk</Text>
				</View>
				{deneme.cozenSayisi !== null ? (
					<View className="flex-row items-center gap-1">
						<Users size={14} color="#64748b" />
						<Text className="text-slate-500 text-xs">
							{formatNumberTR(deneme.cozenSayisi)} öğrenci çözdü
						</Text>
					</View>
				) : null}
			</View>

			<View className="mt-5 flex-row items-center justify-center rounded-xl bg-blue-50 py-2.5">
				<Text className="font-bold text-blue-700 text-sm">Ücretsiz çöz</Text>
				<ArrowRight size={16} color="#1d4ed8" className="ml-1.5" />
			</View>
		</Pressable>
	);
}

function Badge({ label, tone = 'slate' }: { label: string; tone?: 'slate' | 'blue' | 'outline' }) {
	return (
		<View
			className={cn(
				'rounded-full px-2.5 py-1',
				tone === 'blue' && 'bg-blue-50',
				tone === 'outline' && 'border border-slate-300 bg-white',
				tone === 'slate' && 'bg-slate-100',
			)}
		>
			<Text
				className={cn(
					'font-semibold text-xs',
					tone === 'blue' ? 'text-blue-700' : 'text-slate-600',
				)}
			>
				{label}
			</Text>
		</View>
	);
}
