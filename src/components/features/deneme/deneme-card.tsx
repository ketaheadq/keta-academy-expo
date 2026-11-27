import { ArrowRight, Clock, FileQuestion, Users } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { Reveal } from '@/components/shared/motion';
import { type DenemeSummary, SINAV_TURU_LABEL } from '@/lib/deneme';
import { useThemeColors } from '@/lib/theme';
import { cn, formatNumberTR } from '@/lib/utils';

export function DenemeCard({ deneme, onPress }: { deneme: DenemeSummary; onPress: () => void }) {
	const colors = useThemeColors();
	return (
		<Reveal>
			<Pressable
				onPress={onPress}
				accessibilityRole="button"
				accessibilityLabel={`${deneme.baslik}. Ücretsiz çöz`}
				className="rounded-2xl border border-border bg-card p-5 shadow-black/5 shadow-sm active:bg-muted"
			>
				<View className="mb-3 flex-row flex-wrap gap-2">
					<Badge label={SINAV_TURU_LABEL[deneme.sinavTuru]} tone="blue" />
					{deneme.sinif ? <Badge label={deneme.sinif.title} /> : null}
					{deneme.ders ? <Badge label={deneme.ders.title} tone="outline" /> : null}
				</View>

				<Text className="font-bold text-foreground text-lg leading-snug">{deneme.baslik}</Text>
				{deneme.aciklama ? (
					<Text className="mt-2 text-muted-foreground text-sm" numberOfLines={2}>
						{deneme.aciklama}
					</Text>
				) : null}

				<View className="mt-4 flex-row flex-wrap items-center gap-3">
					<View className="flex-row items-center gap-1">
						<FileQuestion size={14} color={colors.mutedForeground} />
						<Text className="text-muted-foreground text-xs">{deneme.soruSayisi} soru</Text>
					</View>
					<View className="flex-row items-center gap-1">
						<Clock size={14} color={colors.mutedForeground} />
						<Text className="text-muted-foreground text-xs">{deneme.sureDakika} dk</Text>
					</View>
					{deneme.cozenSayisi !== null ? (
						<View className="flex-row items-center gap-1">
							<Users size={14} color={colors.mutedForeground} />
							<Text className="text-muted-foreground text-xs">
								{formatNumberTR(deneme.cozenSayisi)} öğrenci çözdü
							</Text>
						</View>
					) : null}
				</View>

				<View className="mt-5 flex-row items-center justify-center rounded-xl bg-accent py-2.5">
					<Text className="font-bold text-accent-foreground text-sm">Ücretsiz çöz</Text>
					<ArrowRight size={16} color={colors.accentForeground} className="ml-1.5" />
				</View>
			</Pressable>
		</Reveal>
	);
}

function Badge({ label, tone = 'slate' }: { label: string; tone?: 'slate' | 'blue' | 'outline' }) {
	return (
		<View
			className={cn(
				'rounded-full px-2.5 py-1',
				tone === 'blue' && 'bg-accent/10',
				tone === 'outline' && 'border border-input bg-card',
				tone === 'slate' && 'bg-muted',
			)}
		>
			<Text
				className={cn(
					'font-semibold text-xs',
					tone === 'blue' ? 'text-accent' : 'text-muted-foreground',
				)}
			>
				{label}
			</Text>
		</View>
	);
}
