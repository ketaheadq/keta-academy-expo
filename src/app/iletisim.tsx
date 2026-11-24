import { Stack } from 'expo-router';
import {
	BookOpen,
	ChevronDown,
	ChevronUp,
	Clock,
	Mail,
	MapPin,
	MessageCircle,
	Phone,
	Users,
} from 'lucide-react-native';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { useAsync } from '@/hooks/use-async';
import { getContactPage } from '@/lib/strapi';
import { cn } from '@/lib/utils';

const FALLBACK_CONTACT = {
	phone: '05451304287',
	email: 'caglar_yildiz@outlook.com.tr',
	address: 'Keklikpınarı Mah. 913. sok.',
};

const HERO_CHIPS = [
	{ icon: Clock, label: '24 saat içinde yanıt' },
	{ icon: Users, label: 'Uzman destek ekibi' },
	{ icon: BookOpen, label: 'Eğitim danışmanlığı' },
];

const FAQ_ITEMS = [
	{
		question: 'Özel ders nasıl alabilirim?',
		answer:
			'Öğretmenler sayfamızdan size uygun öğretmeni seçebilir, randevu alabilir ve online veya yüz yüze ders alabilirsiniz.',
	},
	{
		question: 'Ders içerikleri ücretsiz mi?',
		answer: 'Temel ders içeriklerimiz ücretsizdir. Özel dersler için ücretlendirme yapılmaktadır.',
	},
	{
		question: 'Teknik destek nasıl alabilirim?',
		answer: 'Teknik sorunlarınız için telefon veya e-posta ile bizimle iletişime geçebilirsiniz.',
	},
	{
		question: 'Öğretmen olmak istiyorum, nasıl başvurabilirim?',
		answer: "CV'nizi e-posta adresimize gönderebilir veya telefon ile iletişime geçebilirsiniz.",
	},
];

export default function ContactScreen() {
	const [openIndex, setOpenIndex] = useState(-1);

	const { data } = useAsync(async () => {
		try {
			return await getContactPage();
		} catch {
			return FALLBACK_CONTACT;
		}
	}, []);

	const contact = data ?? FALLBACK_CONTACT;

	return (
		<View className="flex-1 bg-white">
			<Stack.Screen options={{ title: 'İletişim' }} />
			<ScrollView className="flex-1">
				<View className="bg-blue-600 px-6 py-12">
					<Text className="text-center font-bold text-3xl text-white leading-tight">
						Bizimle İletişime Geçin
					</Text>
					<Text className="mt-4 text-center text-base text-blue-100 leading-relaxed">
						Sorularınız, önerileriniz veya destek talepleriniz için buradayız. Size en kısa sürede
						dönüş yapacağız.
					</Text>
					<View className="mt-6 flex-row flex-wrap justify-center gap-3">
						{HERO_CHIPS.map((chip) => (
							<View
								key={chip.label}
								className="flex-row items-center gap-2 rounded-full bg-white/15 px-3 py-1.5"
							>
								<chip.icon size={14} color="#ffffff" />
								<Text className="text-sm text-white">{chip.label}</Text>
							</View>
						))}
					</View>
				</View>

				<View className="p-5">
					<View className="rounded-2xl border border-slate-200 bg-white p-5">
						<View className="mb-1 flex-row items-center gap-2">
							<MessageCircle size={22} color="#2563eb" />
							<Text className="font-bold text-slate-900 text-xl">İletişim Bilgileri</Text>
						</View>
						<Text className="mb-5 text-slate-500 text-sm">
							Bize ulaşmak için aşağıdaki bilgileri kullanabilirsiniz
						</Text>

						<View className="gap-3">
							<View className="flex-row items-start gap-4 rounded-xl bg-blue-50 p-4">
								<View className="rounded-lg bg-blue-600 p-2">
									<Phone size={18} color="#ffffff" />
								</View>
								<View className="flex-1">
									<Text className="font-semibold text-slate-900">Telefon</Text>
									<Pressable
										onPress={() => void Linking.openURL(`tel:${contact.phone}`)}
										className="self-start active:opacity-70"
									>
										<Text className="font-medium text-blue-600">{contact.phone}</Text>
									</Pressable>
									<Text className="mt-1 text-slate-500 text-sm">
										Pazartesi - Cuma: 09:00 - 18:00
									</Text>
								</View>
							</View>

							<View className="flex-row items-start gap-4 rounded-xl bg-blue-50 p-4">
								<View className="rounded-lg bg-blue-600 p-2">
									<Mail size={18} color="#ffffff" />
								</View>
								<View className="flex-1">
									<Text className="font-semibold text-slate-900">E-posta</Text>
									<Pressable
										onPress={() => void Linking.openURL(`mailto:${contact.email}`)}
										className="self-start active:opacity-70"
									>
										<Text className="font-medium text-blue-600">{contact.email}</Text>
									</Pressable>
									<Text className="mt-1 text-slate-500 text-sm">
										24 saat içinde yanıt veriyoruz
									</Text>
								</View>
							</View>

							<View className="flex-row items-start gap-4 rounded-xl bg-blue-50 p-4">
								<View className="rounded-lg bg-blue-600 p-2">
									<MapPin size={18} color="#ffffff" />
								</View>
								<View className="flex-1">
									<Text className="font-semibold text-slate-900">Adres</Text>
									<Text className="font-medium text-blue-600">{contact.address}</Text>
									<Text className="mt-1 text-slate-500 text-sm">Ofis ziyaretleri randevu ile</Text>
								</View>
							</View>
						</View>
					</View>

					<View className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
						<Text className="text-center font-bold text-slate-900 text-xl">
							Sıkça Sorulan Sorular
						</Text>
						<Text className="mt-1 mb-4 text-center text-slate-500 text-sm">
							En çok merak edilen sorular ve yanıtları
						</Text>
						<View className="gap-2">
							{FAQ_ITEMS.map((item, index) => {
								const open = openIndex === index;
								return (
									<View
										key={item.question}
										className={cn(
											'overflow-hidden rounded-xl border',
											open ? 'border-blue-200' : 'border-slate-200',
										)}
									>
										<Pressable
											onPress={() => setOpenIndex(open ? -1 : index)}
											className="flex-row items-center justify-between gap-3 p-4 active:bg-slate-50"
										>
											<Text className="flex-1 font-semibold text-slate-900 text-sm">
												{item.question}
											</Text>
											{open ? (
												<ChevronUp size={18} color="#2563eb" />
											) : (
												<ChevronDown size={18} color="#64748b" />
											)}
										</Pressable>
										{open ? (
											<View className="border-slate-100 border-t px-4 py-3">
												<Text className="text-slate-600 text-sm leading-relaxed">
													{item.answer}
												</Text>
											</View>
										) : null}
									</View>
								);
							})}
						</View>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}
