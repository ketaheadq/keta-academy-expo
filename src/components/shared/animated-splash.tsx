import { Atom, BookOpen, GraduationCap, Sigma } from 'lucide-react-native';
import { useEffect } from 'react';
import { Text, View, type ViewStyle } from 'react-native';
import Animated, {
	Easing,
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withDelay,
	withRepeat,
	withTiming,
} from 'react-native-reanimated';

const FLOATERS = [
	{ Icon: Sigma, top: '24%', left: '14%', delay: 0 },
	{ Icon: BookOpen, top: '20%', right: '13%', delay: 180 },
	{ Icon: GraduationCap, bottom: '25%', left: '18%', delay: 320 },
	{ Icon: Sigma, bottom: '22%', right: '16%', delay: 120 },
] as const;

export function AnimatedSplash({ ready, onFinish }: { ready: boolean; onFinish: () => void }) {
	const reduceMotion = useReducedMotion();
	const opacity = useSharedValue(1);
	const scale = useSharedValue(reduceMotion ? 1 : 0.88);

	useEffect(() => {
		scale.value = withTiming(1, {
			duration: reduceMotion ? 0 : 620,
			easing: Easing.out(Easing.back(1.4)),
		});
	}, [reduceMotion, scale]);

	useEffect(() => {
		if (!ready) return;
		opacity.value = withDelay(
			reduceMotion ? 180 : 700,
			withTiming(0, { duration: reduceMotion ? 0 : 360 }, (finished) => {
				if (finished) onFinish();
			}),
		);
	}, [onFinish, opacity, ready, reduceMotion]);

	const contentStyle = useAnimatedStyle(() => ({
		opacity: opacity.value,
		transform: [{ scale: scale.value }],
	}));

	return (
		<Animated.View
			accessible
			accessibilityLabel="Keta Akademi açılıyor"
			accessibilityViewIsModal
			aria-modal
			style={{
				position: 'absolute',
				inset: 0,
				zIndex: 100,
				backgroundColor: '#0f172a',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<Animated.View style={[contentStyle, { alignItems: 'center' }]}>
				<View className="mb-8 size-36 items-center justify-center">
					<OrbitRing reduceMotion={reduceMotion} />
					<OrbitRing reduceMotion={reduceMotion} reverse delay={250} />
					<View className="size-24 items-center justify-center rounded-full border border-white/15 bg-white/10">
						<Atom size={52} color="#fdba74" strokeWidth={1.6} />
					</View>
				</View>
				<Text className="font-extrabold text-3xl text-white tracking-tight">Keta Akademi</Text>
				<Text className="mt-2 text-[#94a3b8] text-base">Öğrenmek bir keşif.</Text>
				<View className="mt-7 h-1 w-12 overflow-hidden rounded-full bg-white/15">
					<LoadingLine reduceMotion={reduceMotion} />
				</View>
			</Animated.View>

			{FLOATERS.map(({ Icon, delay, ...position }, index) => (
				<FloatingSymbol
					key={index}
					Icon={Icon}
					delay={delay}
					reduceMotion={reduceMotion}
					position={position}
				/>
			))}
		</Animated.View>
	);
}

function OrbitRing({
	reduceMotion,
	reverse = false,
	delay = 0,
}: {
	reduceMotion: boolean;
	reverse?: boolean;
	delay?: number;
}) {
	const rotation = useSharedValue(0);

	useEffect(() => {
		if (reduceMotion) return;
		rotation.value = withRepeat(
			withDelay(
				delay,
				withTiming(reverse ? -360 : 360, {
					duration: 7200,
					easing: Easing.linear,
				}),
			),
			-1,
		);
	}, [delay, reduceMotion, reverse, rotation]);

	const style = useAnimatedStyle(() => ({
		position: 'absolute',
		width: 144,
		height: 62,
		borderWidth: 1,
		borderColor: 'rgba(245, 158, 11, 0.34)',
		borderRadius: 999,
		transform: [{ rotate: `${rotation.value + (reverse ? 60 : 0)}deg` }],
	}));

	return <Animated.View style={style} />;
}

function LoadingLine({ reduceMotion }: { reduceMotion: boolean }) {
	const progress = useSharedValue(0);

	useEffect(() => {
		if (reduceMotion) {
			progress.value = 1;
			return;
		}
		progress.value = withRepeat(
			withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) }),
			-1,
			true,
		);
	}, [progress, reduceMotion]);

	const style = useAnimatedStyle(() => ({
		width: `${progress.value * 100}%`,
		height: '100%',
		backgroundColor: '#f59e0b',
		borderRadius: 999,
	}));

	return <Animated.View style={style} />;
}

function FloatingSymbol({
	Icon,
	delay,
	reduceMotion,
	position,
}: {
	Icon: typeof Sigma;
	delay: number;
	reduceMotion: boolean;
	position: Pick<ViewStyle, 'top' | 'bottom' | 'left' | 'right'>;
}) {
	const progress = useSharedValue(0);

	useEffect(() => {
		if (reduceMotion) return;
		progress.value = withDelay(
			delay,
			withRepeat(withTiming(1, { duration: 2400, easing: Easing.inOut(Easing.quad) }), -1, true),
		);
	}, [delay, progress, reduceMotion]);

	const style = useAnimatedStyle(() => ({
		opacity: 0.35 + progress.value * 0.35,
		transform: [{ translateY: progress.value * -10 }, { rotate: `${progress.value * 8}deg` }],
	}));

	return (
		<Animated.View style={[{ position: 'absolute' }, position, style]}>
			<Icon size={24} color="#93c5fd" strokeWidth={1.5} />
		</Animated.View>
	);
}
