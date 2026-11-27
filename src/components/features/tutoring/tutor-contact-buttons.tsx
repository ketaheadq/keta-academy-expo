import { MessageCircle, Phone } from 'lucide-react-native';
import { Linking, Pressable, Text, View } from 'react-native';
import type { StrapiTutoringProfile } from '@/lib/strapi';
import { cn, telUrl, tutorWhatsappMessage, whatsappUrl } from '@/lib/utils';

/** WhatsApp (pre-filled message) and call buttons for a tutor. Renders nothing without a phone. */
export function TutorContactButtons({
	tutor,
	fallbackPhone = null,
	compact = false,
}: {
	tutor: StrapiTutoringProfile;
	fallbackPhone?: string | null;
	compact?: boolean;
}) {
	const phone = tutor.phone || fallbackPhone;
	const whatsapp = whatsappUrl(phone, tutorWhatsappMessage(tutor.name));
	const tel = telUrl(phone);
	if (!whatsapp && !tel) return null;

	return (
		<View className="flex-row gap-2">
			{whatsapp ? (
				<Pressable
					onPress={(event) => {
						event.stopPropagation();
						void Linking.openURL(whatsapp);
					}}
					className={cn(
						'flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-[#25D366] active:opacity-80',
						compact ? 'py-2.5' : 'py-3.5',
					)}
				>
					<MessageCircle size={compact ? 16 : 20} color="#ffffff" />
					<Text className="font-bold text-sm text-white">WhatsApp'tan Yaz</Text>
				</Pressable>
			) : null}
			{tel ? (
				<Pressable
					onPress={(event) => {
						event.stopPropagation();
						void Linking.openURL(tel);
					}}
					className={cn(
						'flex-row items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white active:bg-slate-50',
						compact ? 'px-4 py-2.5' : 'flex-1 py-3.5',
					)}
				>
					<Phone size={compact ? 16 : 20} color="#334155" />
					<Text className="font-bold text-slate-700 text-sm">Ara</Text>
				</Pressable>
			) : null}
		</View>
	);
}
