import type { LucideIcon } from 'lucide-react-native';
import { AlertTriangle } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

export function LoadingState({ label = 'Yükleniyor...' }: { label?: string }) {
	return (
		<View className="flex-1 items-center justify-center gap-3 bg-background py-20">
			<ActivityIndicator size="large" color="#2563eb" />
			<Text className="text-muted-foreground text-sm">{label}</Text>
		</View>
	);
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
	return (
		<View className="flex-1 items-center justify-center gap-3 px-8 py-20">
			<AlertTriangle size={32} color="#dc2626" />
			<Text className="text-center font-semibold text-foreground text-lg">Bir hata oluştu</Text>
			<Text className="text-center text-muted-foreground text-sm">{message}</Text>
			{onRetry ? (
				<Pressable
					onPress={onRetry}
					className="mt-2 rounded-full bg-blue-600 px-6 py-3 active:bg-blue-700"
				>
					<Text className="font-bold text-sm text-white">Tekrar Dene</Text>
				</Pressable>
			) : null}
		</View>
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
	return (
		<View className="items-center gap-3 px-8 py-16">
			{Icon ? (
				<View className="size-16 items-center justify-center rounded-full bg-slate-100">
					<Icon size={28} color="#64748b" />
				</View>
			) : null}
			<Text className="text-center font-bold text-foreground text-lg">{title}</Text>
			{description ? (
				<Text className="text-center text-muted-foreground text-sm">{description}</Text>
			) : null}
			{actionLabel && onAction ? (
				<Pressable
					onPress={onAction}
					className="mt-2 rounded-full bg-blue-600 px-6 py-3 active:bg-blue-700"
				>
					<Text className="font-bold text-sm text-white">{actionLabel}</Text>
				</Pressable>
			) : null}
		</View>
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
		<View className="mb-4 flex-row items-center justify-between">
			<Text className="flex-1 font-extrabold text-foreground text-xl">{title}</Text>
			{actionLabel && onAction ? (
				<Pressable onPress={onAction} className="active:opacity-70">
					<Text className="font-bold text-blue-600 text-sm">{actionLabel}</Text>
				</Pressable>
			) : null}
		</View>
	);
}
