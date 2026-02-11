import { Play } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from 'react-native';
import { getCourses } from '@/lib/strapi';

export default function CoursesScreen() {
	const [courses, setCourses] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function loadCourses() {
			try {
				const data = await getCourses();
				setCourses(data);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		}

		loadCourses();
	}, []);

	if (loading) {
		return (
			<View className="flex-1 items-center justify-center bg-white">
				<ActivityIndicator size="large" color="#2563eb" />
			</View>
		);
	}

	return (
		<View className="flex-1 bg-white">
			<FlatList
				data={courses}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={{ padding: 16 }}
				renderItem={({ item }) => (
					<Pressable className="mb-4 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-transform active:scale-[0.98]">
						{item.thumbnail?.url && (
							<Image
								source={{ uri: item.thumbnail.url }}
								className="h-48 w-full bg-slate-100"
								resizeMode="cover"
							/>
						)}
						<View className="p-4">
							<View className="mb-2 flex-row items-center">
								<Text className="rounded bg-blue-50 px-2 py-1 font-bold text-blue-600 text-xs uppercase">
									{item.subject?.title || 'Ders'}
								</Text>
								<View className="ml-auto flex-row items-center">
									<Play size={14} color="#64748b" />
									<Text className="ml-1 text-slate-500 text-xs">{item.duration || 0} dk</Text>
								</View>
							</View>
							<Text className="mb-1 font-bold text-lg text-slate-900">{item.title}</Text>
							<Text className="text-slate-600 text-sm" numberOfLines={2}>
								{item.description}
							</Text>
						</View>
					</Pressable>
				)}
			/>
		</View>
	);
}
