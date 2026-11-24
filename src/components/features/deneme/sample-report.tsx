import { FileText } from 'lucide-react-native';
import { Image, Linking, Pressable, Text, View } from 'react-native';

/** The sample report pages and PDF ship with the web app's public folder, not the bundle. */
const WEB_ORIGIN = 'https://ketalearn.cloud';
const SAMPLE_PAGES = [1, 2];
const SAMPLE_PAGE_RATIO = 744 / 1052;

export function SampleReport() {
	const openSamplePdf = () => void Linking.openURL(`${WEB_ORIGIN}/ornek-deneme-raporu.pdf`);

	return (
		<View className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<View className="mb-3 flex-row items-center justify-between gap-2">
				<Text className="flex-1 font-bold text-lg text-slate-900">Örnek analiz raporu</Text>
				<Pressable
					onPress={openSamplePdf}
					className="flex-row items-center gap-1 active:opacity-70"
				>
					<FileText size={16} color="#2563eb" />
					<Text className="text-blue-600 text-sm underline">Örneğin tamamı (PDF)</Text>
				</Pressable>
			</View>

			<View className="flex-row gap-3">
				{SAMPLE_PAGES.map((page) => (
					<Image
						key={page}
						source={{ uri: `${WEB_ORIGIN}/images/ornek-deneme-raporu-${page}.jpg` }}
						resizeMode="cover"
						className="flex-1 rounded-md border border-slate-200"
						style={{ aspectRatio: SAMPLE_PAGE_RATIO }}
					/>
				))}
			</View>

			<Text className="mt-3 text-slate-500 text-xs">
				Örnektir: senin raporun kendi cevaplarınla hazırlanır.
			</Text>
		</View>
	);
}
