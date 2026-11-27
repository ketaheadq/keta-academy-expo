import { Star } from 'lucide-react-native';
import { View } from 'react-native';
import { useThemeColors } from '@/lib/theme';

/**
 * Five stars with partial fill for the last one, matching the web `RatingStars`
 * (a fractional average like 4.3 shows three full stars, one 30%-filled star).
 */
export function RatingStars({ rating, size = 16 }: { rating: number; size?: number }) {
	const colors = useThemeColors();

	return (
		<View className="flex-row items-center">
			{[1, 2, 3, 4, 5].map((star) => {
				const fill = Math.max(0, Math.min(1, rating - (star - 1)));
				return (
					<View
						key={star}
						style={{ width: size + 2, height: size + 2 }}
						className="items-center justify-center overflow-hidden"
					>
						{fill > 0 && fill < 1 ? (
							<View style={{ width: (size + 2) * fill }} className="overflow-hidden">
								<Star size={size} color={colors.warning} fill={colors.warning} />
							</View>
						) : fill >= 1 ? (
							<Star size={size} color={colors.warning} fill={colors.warning} />
						) : (
							<Star size={size} color={colors.input} />
						)}
					</View>
				);
			})}
		</View>
	);
}
