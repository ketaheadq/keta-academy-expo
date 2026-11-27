import { BookOpen } from 'lucide-react-native';
import { type ReactNode, useEffect } from 'react';
import { type StyleProp, Text, View, type ViewStyle } from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withDelay,
	withRepeat,
	withTiming,
} from 'react-native-reanimated';
import { type AppTheme, useThemeColors } from '@/lib/theme';

export function Reveal({
	children,
	delay = 0,
	distance = 14,
	style,
}: {
	children: ReactNode;
	delay?: number;
	distance?: number;
	style?: StyleProp<ViewStyle>;
}) {
	const reduceMotion = useReducedMotion();
	const progress = useSharedValue(reduceMotion ? 1 : 0);

	useEffect(() => {
		progress.value = reduceMotion
			? 1
			: withDelay(delay, withTiming(1, { duration: 440, easing: Easing.out(Easing.cubic) }));
	}, [delay, progress, reduceMotion]);

	const animatedStyle = useAnimatedStyle(() => ({
		opacity: progress.value,
		transform: [{ translateY: (1 - progress.value) * distance }],
	}));

	return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

export function AnimatedProgress({
	progress,
	className = 'h-2',
	trackClassName = 'bg-muted',
	tone = 'primary',
	color: requestedColor,
	accessibilityLabel = 'İlerleme',
}: {
	progress: number;
	className?: string;
	trackClassName?: string;
	tone?: 'primary' | 'success';
	color?: string;
	accessibilityLabel?: string;
}) {
	const colors = useThemeColors();
	const reduceMotion = useReducedMotion();
	const color = requestedColor ?? (tone === 'success' ? colors.success : colors.primary);
	const width = useSharedValue(0);
	const normalizedProgress = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0;

	useEffect(() => {
		const next = normalizedProgress;
		width.value = reduceMotion
			? next
			: withTiming(next, { duration: 650, easing: Easing.out(Easing.cubic) });
	}, [normalizedProgress, reduceMotion, width]);

	const style = useAnimatedStyle(
		() => ({
			width: `${width.value}%`,
			height: '100%',
			borderRadius: 999,
			backgroundColor: color,
		}),
		[color],
	);

	return (
		<View
			className={`${className} overflow-hidden rounded-full ${trackClassName}`}
			accessibilityRole="progressbar"
			accessibilityLabel={accessibilityLabel}
			accessibilityValue={{ min: 0, max: 100, now: Math.round(normalizedProgress) }}
		>
			<Animated.View style={style} />
		</View>
	);
}

export function LearningLoader({ label = 'Öğrenmeye hazırlanıyor...' }: { label?: string }) {
	const colors = useThemeColors();
	const reduceMotion = useReducedMotion();

	return (
		<View className="flex-1 items-center justify-center gap-5 px-8 py-20">
			<View className="size-20 items-center justify-center rounded-full bg-primary/10">
				<BookOpen size={34} color={colors.primary} />
			</View>
			<View className="h-3 flex-row items-center gap-2">
				{[0, 1, 2].map((index) => (
					<LearningDot
						key={index}
						index={index}
						reduceMotion={reduceMotion}
						color={colors.primary}
					/>
				))}
			</View>
			<Text className="px-4 text-center text-muted-foreground text-sm">{label}</Text>
		</View>
	);
}

function LearningDot({
	index,
	reduceMotion,
	color,
}: {
	index: number;
	reduceMotion: boolean;
	color: string;
}) {
	const progress = useSharedValue(0.35);

	useEffect(() => {
		if (reduceMotion) {
			progress.value = 0.65;
			return;
		}
		progress.value = withDelay(
			index * 120,
			withRepeat(withTiming(1, { duration: 520, easing: Easing.inOut(Easing.quad) }), -1, true),
		);
	}, [index, progress, reduceMotion]);

	const style = useAnimatedStyle(() => ({
		opacity: progress.value,
		transform: [{ translateY: (1 - progress.value) * -5 }],
	}));

	return (
		<Animated.View
			style={[{ width: 7, height: 7, borderRadius: 999, backgroundColor: color }, style]}
		/>
	);
}

type ConfettiSpec = { x: number; delay: number; tone: keyof AppTheme; rotate: number };

const CONFETTI = [
	{ x: 22, delay: 0, tone: 'accent', rotate: 24 },
	{ x: 44, delay: 70, tone: 'primary', rotate: -18 },
	{ x: 66, delay: 30, tone: 'info', rotate: 38 },
	{ x: 88, delay: 110, tone: 'chart4', rotate: -28 },
	{ x: 34, delay: 150, tone: 'primary', rotate: 12 },
	{ x: 76, delay: 190, tone: 'accent', rotate: -36 },
] as const satisfies readonly ConfettiSpec[];

export function Celebration() {
	const colors = useThemeColors();
	const reduceMotion = useReducedMotion();
	if (reduceMotion) return null;

	return (
		<View pointerEvents="none" className="absolute inset-x-0 top-0 h-24 items-center">
			{CONFETTI.map((piece, index) => (
				<ConfettiPiece
					key={index}
					color={colors[piece.tone]}
					delay={piece.delay}
					rotate={piece.rotate}
					x={piece.x}
				/>
			))}
		</View>
	);
}

function ConfettiPiece({
	color,
	delay,
	rotate,
	x,
}: {
	color: string;
	delay: number;
	rotate: number;
	x: number;
}) {
	const progress = useSharedValue(0);

	useEffect(() => {
		progress.value = withDelay(
			delay,
			withTiming(1, { duration: 1250, easing: Easing.out(Easing.cubic) }),
		);
	}, [delay, progress]);

	const style = useAnimatedStyle(() => {
		const value = progress.value;
		return {
			opacity: value < 0.15 ? value / 0.15 : Math.max(0, 1 - (value - 0.65) / 0.35),
			transform: [
				{ translateY: -18 + value * 82 },
				{ rotate: `${rotate + value * 70}deg` },
				{ scale: 0.7 + Math.sin(value * Math.PI) * 0.45 },
			],
		};
	});

	return (
		<Animated.View
			style={[
				{
					position: 'absolute',
					top: 18,
					left: `${x}%`,
					width: x % 3 === 0 ? 10 : 7,
					height: 7,
					borderRadius: 3,
					backgroundColor: color,
				},
				style,
			]}
		/>
	);
}
