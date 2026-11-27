import { Link, Stack, useRouter } from 'expo-router';
import { FileQuestion } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useThemeColors } from '@/lib/theme';

export default function NotFoundScreen() {
	const router = useRouter();
	const colors = useThemeColors();

	return (
		<>
			<Stack.Screen options={{ title: 'Sayfa Bulunamadı' }} />
			<View className="flex-1 items-center justify-center gap-4 bg-background px-8">
				<View className="size-20 items-center justify-center rounded-full bg-muted">
					<FileQuestion size={38} color={colors.mutedForeground} />
				</View>
				<Text className="font-extrabold text-2xl text-foreground">Sayfa Bulunamadı</Text>
				<Text className="text-center text-muted-foreground">
					Üzgünüz, aradığınız sayfayı bulamadık.
				</Text>

				<View className="mt-2 flex-row gap-3">
					<Link
						href="/"
						className="items-center rounded-full bg-primary px-6 py-3 active:bg-primary/90"
					>
						<Text className="font-bold text-primary-foreground text-sm">Ana Sayfaya Git</Text>
					</Link>
					<Pressable
						onPress={() => router.back()}
						className="items-center rounded-full border border-input bg-card px-6 py-3 active:bg-muted"
					>
						<Text className="font-bold text-secondary-foreground text-sm">Geri Git</Text>
					</Pressable>
				</View>
			</View>
		</>
	);
}
