import { Link, Stack } from 'expo-router';
import { ChevronDown, ChevronUp, HelpCircle, MessageCircle } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useThemeColors } from '@/lib/theme';
import { cn } from '@/lib/utils';

const FAQ_ITEMS = [
	{
		question: 'KetaLearn nedir?',
		answer:
			'KetaLearn, üniversite sınavlarına (YKS, TYT, AYT) hazırlanan öğrencilere kapsamlı bir eğitim platformu sunar. Binlerce ücretsiz ders videosu, güncel taban puanları, blog yazıları ve interaktif içeriklerle öğrencilerin başarıya ulaşmasını hedefliyoruz.',
	},
	{
		question: 'Koçluk sistemi nasıl çalışır?',
		answer:
			'KetaLearn bünyesinde yer alan uzman rehberler ve eğitim koçları ile öğrencilerimizi birebir buluşturuyoruz. Kişiye özel çalışma programları, hedef belirleme ve motivasyon desteği ile sınav sürecini en verimli şekilde yönetmenizi sağlıyoruz.',
	},
	{
		question: 'Eğitim videolarına nasıl ulaşabilirim?',
		answer:
			"Platformumuzda yer alan 'Konular' sekmesinden istediğiniz dersi seçebilir, binlerce ücretsiz videoyu izleyerek eksiklerinizi tamamlayabilirsiniz. Ayrıca 'Videolar' sayfamızdan en güncel içeriklerimize kolayca erişebilirsiniz.",
	},
	{
		question: 'Hocalarla nasıl iletişim kurabilirim?',
		answer:
			'Platformumuz üzerinden dilediğiniz branşta uzman hocalarımızla online görüşmeler planlayabilir, sorularınızı soraiblir ve konu anlatımı desteği alabilirsiniz. Canlı yayınlar ve interaktif soru-cevap seansları ile hocalarımız her zaman yanınızda.',
	},
	{
		question: 'KetaLearn tamamen ücretsiz mi?',
		answer:
			'Platformumuzdaki ders videoları, taban puanları ve blog içerikleri tamamen ücretsizdir. Özel koçluk ve birebir canlı görüşmeler gibi bazı premium servislerimiz ek hizmet olarak sunulmaktadır.',
	},
	{
		question: 'Sistemdeki ilerlememi nasıl takip edebilirim?',
		answer:
			"Üye girişi yaptıktan sonra izlediğiniz videoları ve çözdüğünüz quizleri profiliniz üzerinden takip edebilirsiniz. 'Kaldığım Yerden Devam Et' özelliği sayesinde öğrenme süreciniz asla bölünmez.",
	},
];

export default function FaqScreen() {
	const [openIndex, setOpenIndex] = useState(0);
	const colors = useThemeColors();

	return (
		<View className="flex-1 bg-background">
			<Stack.Screen options={{ title: 'Sıkça Sorulan Sorular' }} />
			<ScrollView className="flex-1">
				<View className="px-5 pt-10 pb-6">
					<View className="mb-4 flex-row items-center justify-center">
						<View className="size-14 items-center justify-center rounded-full bg-accent">
							<HelpCircle size={28} color={colors.primary} />
						</View>
					</View>
					<Text className="text-center font-bold text-3xl text-foreground">
						Sıkça Sorulan Sorular
					</Text>
					<Text className="mt-3 text-center text-base text-muted-foreground leading-relaxed">
						KetaLearn hakkında merak ettiğiniz her şey burada. Eğer aradığınız cevabı bulamazsanız
						bizimle iletişime geçmekten çekinmeyin.
					</Text>
				</View>

				<View className="gap-3 px-5 pb-8">
					{FAQ_ITEMS.map((item, index) => {
						const open = openIndex === index;
						return (
							<View
								key={item.question}
								className={cn(
									'overflow-hidden rounded-2xl border bg-card',
									open ? 'border-primary' : 'border-input',
								)}
							>
								<Pressable
									accessibilityState={{ expanded: open }}
									onPress={() => setOpenIndex(open ? -1 : index)}
									className="flex-row items-center justify-between gap-3 p-4 active:bg-muted"
								>
									<Text className="flex-1 font-semibold text-foreground text-sm">
										{item.question}
									</Text>
									{open ? (
										<ChevronUp size={18} color={colors.primary} />
									) : (
										<ChevronDown size={18} color={colors.mutedForeground} />
									)}
								</Pressable>
								{open ? (
									<View className="border-border border-t px-4 py-3">
										<Text className="text-muted-foreground text-sm leading-relaxed">
											{item.answer}
										</Text>
									</View>
								) : null}
							</View>
						);
					})}
				</View>

				<View className="mx-5 mb-10 items-center rounded-2xl bg-muted p-6">
					<View className="mb-4 flex-row items-center gap-2 rounded-full bg-accent px-4 py-1.5">
						<MessageCircle size={14} color={colors.primary} />
						<Text className="font-medium text-accent-foreground text-xs">Hala sorunuz mu var?</Text>
					</View>
					<Text className="text-center font-bold text-foreground text-xl">
						Size daha fazla yardımcı olabiliriz
					</Text>
					<Text className="mt-2 text-center text-muted-foreground text-sm leading-relaxed">
						Hocalarımızla görüşmek veya koçluk sistemi hakkında daha fazla bilgi almak için
						tıklayın.
					</Text>
					<View className="mt-6 w-full gap-3">
						<Pressable
							onPress={() => void Linking.openURL('mailto:info@ketalearn.cloud')}
							className="items-center rounded-full bg-primary py-3.5 active:bg-primary/90"
						>
							<Text className="font-bold text-primary-foreground text-sm">Bize Ulaşın</Text>
						</Pressable>
						<Link
							href="/iletisim"
							className="items-center rounded-full border border-input bg-card py-3.5 active:bg-muted"
						>
							<Text className="font-bold text-secondary-foreground text-sm">İletişim Formu</Text>
						</Link>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}
