import { Link, Stack } from 'expo-router';
import { FileText } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { LoadingState } from '@/components/shared/states';
import { useAsync } from '@/hooks/use-async';
import { openExternalUrl } from '@/lib/routes';
import { getTermsAndCondition } from '@/lib/strapi';
import { useThemeColors } from '@/lib/theme';
import { extractTextFromBlocks, formatDateTR } from '@/lib/utils';

export default function TermsOfServiceScreen() {
	const { data, loading, error, reload } = useAsync(getTermsAndCondition, []);
	const colors = useThemeColors();

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
					Hizmet şartları yüklenirken bir hata oluştu.
				</Text>
				<Pressable
					onPress={reload}
					className="mt-2 rounded-full bg-primary px-6 py-3 active:bg-primary/90"
				>
					<Text className="font-bold text-primary-foreground text-sm">Tekrar Dene</Text>
				</Pressable>
			</View>
		);
	} else {
		body = (
			<ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20 }}>
				<View className="rounded-2xl border border-border bg-card p-5">
					<View className="mb-3 flex-row items-center gap-2">
						<FileText size={20} color={colors.primary} />
						<Text className="font-bold text-card-foreground text-xl">Hizmet Şartları</Text>
					</View>
					<Text className="mb-4 text-muted-foreground text-xs">
						Son güncelleme: {formatDateTR(data?.updatedAt)}
					</Text>
					{paragraphs.length > 0 ? (
						paragraphs.map((paragraph, index) => (
							<Text
								key={`paragraph-${index}`}
								className="mb-3 text-base text-card-foreground leading-6"
							>
								{paragraph}
							</Text>
						))
					) : (
						<Text className="text-muted-foreground text-sm">
							Hizmet şartları içeriği bulunamadı.
						</Text>
					)}
				</View>

				<Text className="mt-6 text-center text-muted-foreground text-sm">
					Sorularınız için{' '}
					<Text
						className="text-primary underline"
						onPress={() => openExternalUrl('mailto:destek@ketaacademy.com')}
					>
						destek@ketaacademy.com
					</Text>{' '}
					adresinden bize ulaşabilirsiniz.
				</Text>

				<Link href="/kayit-ol" className="mt-6 items-center active:opacity-70">
					<Text className="font-bold text-primary text-sm">Kayıt Sayfasına Dön</Text>
				</Link>
			</ScrollView>
		);
	}

	return (
		<View className="flex-1 bg-background">
			<Stack.Screen options={{ title: 'Hizmet Şartları' }} />
			{body}
		</View>
	);
}
