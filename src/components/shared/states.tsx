import type { LucideIcon } from 'lucide-react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { LearningLoader, Reveal } from '@/components/shared/motion';
import { useThemeColors } from '@/lib/theme';

export function LoadingState({ label = 'Yükleniyor...' }: { label?: string }) {
	return <LearningLoader label={label} />;
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
	const colors = useThemeColors();
	return (
		<Reveal style={{ flex: 1 }}>
			<View className="flex-1 items-center justify-center gap-3 bg-background px-8 py-20">
				<View className="size-16 items-center justify-center rounded-full bg-destructive/10">
					<AlertTriangle size={30} color={colors.destructive} />
				</View>
				<Text className="text-center font-semibold text-foreground text-lg">Bir hata oluştu</Text>
				<Text className="text-center text-muted-foreground text-sm">{message}</Text>
				{onRetry ? (
					<Pressable
						onPress={onRetry}
						className="mt-2 rounded-full bg-primary px-6 py-3 active:bg-primary/90"
					>
						<Text className="font-bold text-primary-foreground text-sm">Tekrar Dene</Text>
					</Pressable>
				) : null}
			</View>
		</Reveal>
	);
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	actionLabel,
	onAction,
}: {
	icon?: LucideIcon;
	title: string;
	description?: string;
	actionLabel?: string;
	onAction?: () => void;
}) {
	const colors = useThemeColors();
	return (
		<Reveal>
			<View className="items-center gap-3 px-8 py-16">
				{Icon ? (
					<View className="size-16 items-center justify-center rounded-full bg-accent">
						<Icon size={28} color={colors.primary} />
					</View>
				) : null}
				<Text className="text-center font-bold text-foreground text-lg">{title}</Text>
				{description ? (
					<Text className="text-center text-muted-foreground text-sm">{description}</Text>
				) : null}
				{actionLabel && onAction ? (
					<Pressable
						onPress={onAction}
						className="mt-2 rounded-full bg-primary px-6 py-3 active:bg-primary/90"
					>
						<Text className="font-bold text-primary-foreground text-sm">{actionLabel}</Text>
					</Pressable>
				) : null}
			</View>
		</Reveal>
	);
}

export function SectionHeading({
	title,
	actionLabel,
	onAction,
}: {
	title: string;
	actionLabel?: string;
	onAction?: () => void;
}) {
	return (
		<View className="mb-4 flex-row items-center justify-between gap-3">
			<Text className="flex-1 font-extrabold text-foreground text-xl">{title}</Text>
			{actionLabel && onAction ? (
				<Pressable onPress={onAction} className="active:opacity-70">
					<Text className="font-bold text-primary text-sm">{actionLabel}</Text>
				</Pressable>
			) : null}
		</View>
	);
}
