import { ArrowRight, Play, Sparkles } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';

const stats = [
	{ value: '1000+', label: 'Ücretsiz Ders' },
	{ value: '50K+', label: 'Öğrenci' },
	{ value: '4.9', label: 'Puan' },
];

export default function TabOneScreen() {
	return (
		<ScrollView className="flex-1 bg-white">
			<View className="relative px-6 pt-12 pb-16">
				{/* Background Blobs (Simplified for Mobile) */}
				<View className="absolute top-0 right-0 left-0 -z-10 h-96 rounded-full bg-blue-50/30 opacity-50 blur-3xl" />

				<View className="items-center text-center">
					{/* Badge */}
					<View className="mb-8 flex-row items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2">
						<Sparkles size={16} color="#2563eb" />
						<Text className="font-medium text-blue-700 text-sm">Tüm derslere kolaylıkla ulaş!</Text>
					</View>

					{/* Headline */}
					<Text className="mb-6 text-center font-bold text-4xl text-slate-900 leading-tight">
						Öğrenmeye başlamak için <Text className="text-blue-600">en iyi yer</Text>
					</Text>

					{/* Subtitle */}
					<Text className="mb-10 px-4 text-center text-lg text-slate-600 leading-relaxed">
						Binlerce ücretsiz ders, kaldığın yerden devam et, quizlerle kendini test et. Öğrenme
						yolculuğunda her adımda yanındayız.
					</Text>

					{/* Buttons */}
					<View className="mb-16 w-full gap-4 px-4">
						<Pressable className="h-14 flex-row items-center justify-center rounded-full bg-blue-600 shadow-blue-500/30 shadow-lg transition-transform active:scale-95">
							<Text className="mr-2 font-bold text-lg text-white">Hemen Başla</Text>
							<ArrowRight size={20} color="white" />
						</Pressable>

						<Pressable className="h-14 flex-row items-center justify-center rounded-full border border-slate-200 bg-white transition-transform active:scale-95">
							<Play size={20} color="#475569" className="mr-2" />
							<Text className="font-bold text-lg text-slate-700">Nasıl Çalışır?</Text>
						</Pressable>
					</View>

					{/* Stats */}
					<View className="w-full flex-row justify-between border-slate-100 border-t px-4 pt-10">
						{stats.map((stat) => (
							<View key={stat.label} className="flex-1 items-center">
								<Text className="mb-1 font-bold text-2xl text-blue-600">{stat.value}</Text>
								<Text className="text-center font-semibold text-slate-500 text-xs uppercase tracking-wider">
									{stat.label}
								</Text>
							</View>
						))}
					</View>
				</View>
			</View>
		</ScrollView>
	);
}
