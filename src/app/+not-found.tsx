import { Link, Stack, useRouter } from 'expo-router';
import { FileQuestion } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

export default function NotFoundScreen() {
	const router = useRouter();

	return (
		<>
			<Stack.Screen options={{ title: 'Sayfa Bulunamadı' }} />
			<View className="flex-1 items-center justify-center gap-4 bg-slate-50 px-8">
				<View className="size-20 items-center justify-center rounded-full bg-slate-100">
					<FileQuestion size={38} color="#64748b" />
				</View>
				<Text className="font-extrabold text-2xl text-slate-900">Sayfa Bulunamadı</Text>
				<Text className="text-center text-slate-500">Üzgünüz, aradığınız sayfayı bulamadık.</Text>

				<View className="mt-2 flex-row gap-3">
					<Link
						href="/"
						className="items-center rounded-full bg-blue-600 px-6 py-3 active:bg-blue-700"
					>
						<Text className="font-bold text-sm text-white">Ana Sayfaya Git</Text>
					</Link>
					<Pressable
						onPress={() => router.back()}
						className="items-center rounded-full border border-slate-200 bg-white px-6 py-3 active:bg-slate-100"
					>
						<Text className="font-bold text-slate-700 text-sm">Geri Git</Text>
					</Pressable>
				</View>
			</View>
		</>
	);
}
