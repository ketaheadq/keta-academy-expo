import { Link, Stack } from 'expo-router';
import { FileText } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { LoadingState } from '@/components/shared/states';
import { useAsync } from '@/hooks/use-async';
import { getPrivacyPolicy } from '@/lib/strapi';
import { extractTextFromBlocks, formatDateTR } from '@/lib/utils';

export default function PrivacyPolicyScreen() {
	const { data, loading, error, reload } = useAsync(getPrivacyPolicy, []);

	const paragraphs = extractTextFromBlocks(data?.text)
		.split('\n\n')
		.map((paragraph) => paragraph.trim())
		.filter(Boolean);

	let body: ReactNode;
	if (loading && !data) {
		body = <LoadingState />;
	} else if (error && !data) {
		body = (
			<View className="flex-1 items-center gap-3 px-8 py-20">
				<Text className="text-center font-bold text-foreground text-xl">Yükleme Hatası</Text>
				<Text className="text-center text-muted-foreground text-sm">
					Gizlilik politikası yüklenirken bir hata oluştu.
				</Text>
				<Pressable
					onPress={reload}
					className="mt-2 rounded-full bg-blue-600 px-6 py-3 active:bg-blue-700"
				>
					<Text className="font-bold text-sm text-white">Tekrar Dene</Text>
				</Pressable>
			</View>
		);
	} else {
		body = (
			<ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 20 }}>
				<View className="rounded-2xl border border-slate-200 bg-white p-5">
					<View className="mb-3 flex-row items-center gap-2">
						<FileText size={20} color="#2563eb" />
						<Text className="font-bold text-slate-900 text-xl">Gizlilik Politikası</Text>
					</View>
					<Text className="mb-4 text-slate-500 text-xs">
						Son güncelleme: {formatDateTR(data?.updatedAt)}
					</Text>
					{paragraphs.length > 0 ? (
						paragraphs.map((paragraph, index) => (
							<Text key={`paragraph-${index}`} className="mb-3 text-base text-slate-600 leading-6">
								{paragraph}
							</Text>
						))
					) : (
						<Text className="text-slate-500 text-sm">Gizlilik politikası içeriği bulunamadı.</Text>
					)}
				</View>

				<Text className="mt-6 text-center text-slate-500 text-sm">
					Sorularınız için{' '}
					<Text
						className="text-blue-600 underline"
						onPress={() => void Linking.openURL('mailto:destek@ketaacademy.com')}
					>
						destek@ketaacademy.com
					</Text>{' '}
					adresinden bize ulaşabilirsiniz.
				</Text>

				<Link href="/kayit-ol" className="mt-6 items-center active:opacity-70">
					<Text className="font-bold text-blue-600 text-sm">Kayıt Sayfasına Dön</Text>
				</Link>
			</ScrollView>
		);
	}

	return (
		<View className="flex-1 bg-slate-50">
			<Stack.Screen options={{ title: 'Gizlilik Politikası' }} />
			{body}
		</View>
	);
}
