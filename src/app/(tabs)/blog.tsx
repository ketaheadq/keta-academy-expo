import { Calendar, ChevronRight } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, Text, View } from 'react-native';
import { getBlogs } from '@/lib/strapi';

export default function BlogScreen() {
	// const [blogs, setBlogs] = useState<any[]>([]);
	// const [loading, setLoading] = useState(true);

	// useEffect(() => {
	// 	async function loadBlogs() {
	// 		try {
	// 			const data = await getBlogs();
	// 			setBlogs(data);
	// 		} catch (error) {
	// 			console.error(error);
	// 		} finally {
	// 			setLoading(false);
	// 		}
	// 	}

	// 	loadBlogs();
	// }, []);

	// if (loading) {
	// 	return (
	// 		<View className="flex-1 items-center justify-center bg-white">
	// 			<ActivityIndicator size="large" color="#2563eb" />
	// 		</View>
	// 	);
	// }

	return (
		<View className="flex-1 bg-white">
			{/* <FlatList
				data={blogs}
				keyExtractor={(item) => item.id.toString()}
				contentContainerStyle={{ padding: 16 }}
				renderItem={({ item }) => (
					<Pressable className="mb-4 flex-row overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-colors active:bg-slate-50">
						{item.image?.url && (
							<Image
								source={{ uri: item.image.url }}
								className="m-3 h-24 w-24 rounded-xl bg-slate-100"
							/>
						)}
						<View className="flex-1 justify-center p-3">
							<Text className="mb-1 font-bold text-base text-slate-900" numberOfLines={2}>
								{item.title}
							</Text>
							<View className="flex-row items-center">
								<Calendar size={12} color="#64748b" />
								<Text className="ml-1 text-slate-500 text-xs">
									{new Date(item.publishedAt).toLocaleDateString('tr-TR')}
								</Text>
							</View>
						</View>
						<View className="items-center justify-center pr-4">
							<ChevronRight size={20} color="#cbd5e1" />
						</View>
					</Pressable>
				)}
			/> */}
			<Text>BlogScreen</Text>
		</View>
	);
}
