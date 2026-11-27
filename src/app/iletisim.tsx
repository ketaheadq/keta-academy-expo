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
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useAsync } from '@/hooks/use-async';
import { openExternalUrl } from '@/lib/routes';
import { getContactPage } from '@/lib/strapi';
import { useThemeColors } from '@/lib/theme';
import { cn, telUrl } from '@/lib/utils';

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
	const colors = useThemeColors();

	const { data } = useAsync(async () => {
		try {
			return await getContactPage();
		} catch {
			return FALLBACK_CONTACT;
		}
	}, []);

	// Editors can leave a single field blank, so fall back per field instead of trusting one object.
	const contact = {
		phone: data?.phone || FALLBACK_CONTACT.phone,
		email: data?.email || FALLBACK_CONTACT.email,
		address: data?.address || FALLBACK_CONTACT.address,
	};

	return (
		<View className="flex-1 bg-background">
			<Stack.Screen options={{ title: 'İletişim' }} />
			<ScrollView className="flex-1">
				<View className="bg-hero px-6 py-12">
					<Text className="text-center font-bold text-3xl text-hero-foreground leading-tight">
						Bizimle İletişime Geçin
					</Text>
					<Text className="mt-4 text-center text-base text-hero-foreground/85 leading-relaxed">
						Sorularınız, önerileriniz veya destek talepleriniz için buradayız. Size en kısa sürede
						dönüş yapacağız.
					</Text>
					<View className="mt-6 flex-row flex-wrap justify-center gap-3">
						{HERO_CHIPS.map((chip) => (
							<View
								key={chip.label}
								className="flex-row items-center gap-2 rounded-full bg-hero-foreground/15 px-3 py-1.5"
							>
								<chip.icon size={14} color={colors.heroForeground} />
								<Text className="text-hero-foreground text-sm">{chip.label}</Text>
							</View>
						))}
					</View>
				</View>

				<View className="p-5">
					<View className="rounded-2xl border border-border bg-card p-5">
						<View className="mb-1 flex-row items-center gap-2">
							<MessageCircle size={22} color={colors.primary} />
							<Text className="font-bold text-foreground text-xl">İletişim Bilgileri</Text>
						</View>
						<Text className="mb-5 text-muted-foreground text-sm">
							Bize ulaşmak için aşağıdaki bilgileri kullanabilirsiniz
						</Text>

						<View className="gap-3">
							<View className="flex-row items-start gap-4 rounded-xl bg-secondary p-4">
								<View className="rounded-lg bg-accent p-2">
									<Phone size={18} color={colors.accentForeground} />
								</View>
								<View className="flex-1">
									<Text className="font-semibold text-foreground">Telefon</Text>
									<Pressable
										onPress={() => openExternalUrl(telUrl(contact.phone))}
										className="self-start active:opacity-70"
									>
										<Text className="font-medium text-primary">{contact.phone}</Text>
									</Pressable>
									<Text className="mt-1 text-muted-foreground text-sm">
										Pazartesi - Cuma: 09:00 - 18:00
									</Text>
								</View>
							</View>

							<View className="flex-row items-start gap-4 rounded-xl bg-secondary p-4">
								<View className="rounded-lg bg-accent p-2">
									<Mail size={18} color={colors.accentForeground} />
								</View>
								<View className="flex-1">
									<Text className="font-semibold text-foreground">E-posta</Text>
									<Pressable
										onPress={() => openExternalUrl(`mailto:${contact.email}`)}
										className="self-start active:opacity-70"
									>
										<Text className="font-medium text-primary">{contact.email}</Text>
									</Pressable>
									<Text className="mt-1 text-muted-foreground text-sm">
										24 saat içinde yanıt veriyoruz
									</Text>
								</View>
							</View>

							<View className="flex-row items-start gap-4 rounded-xl bg-secondary p-4">
								<View className="rounded-lg bg-accent p-2">
									<MapPin size={18} color={colors.accentForeground} />
								</View>
								<View className="flex-1">
									<Text className="font-semibold text-foreground">Adres</Text>
									<Text className="font-medium text-primary">{contact.address}</Text>
									<Text className="mt-1 text-muted-foreground text-sm">
										Ofis ziyaretleri randevu ile
									</Text>
								</View>
							</View>
						</View>
					</View>

					<View className="mt-6 rounded-2xl border border-border bg-card p-5">
						<Text className="text-center font-bold text-foreground text-xl">
							Sıkça Sorulan Sorular
						</Text>
						<Text className="mt-1 mb-4 text-center text-muted-foreground text-sm">
							En çok merak edilen sorular ve yanıtları
						</Text>
						<View className="gap-2">
							{FAQ_ITEMS.map((item, index) => {
								const open = openIndex === index;
								return (
									<View
										key={item.question}
										className={cn(
											'overflow-hidden rounded-xl border bg-card',
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
					</View>
				</View>
			</ScrollView>
		</View>
	);
}
