import { Link } from 'expo-router';
import { FileText, MessageCircle, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, Text, View } from 'react-native';
import { getRaporOzeti, raporPdfUrl } from '@/lib/deneme';

const POLL_MS = 3000;
const GIVE_UP_MS = 3 * 60 * 1000;

/**
 * Waits for the PDF report (prepared in the background, usually within a minute), then offers to
 * open it or share its link on WhatsApp. After three minutes the buttons appear anyway: the PDF
 * endpoint itself reports "being prepared" until the file is ready.
 */
export function RaporHazir({ raporKey, denemeBaslik }: { raporKey: string; denemeBaslik: string }) {
	const [ready, setReady] = useState(false);
	const [timedOut, setTimedOut] = useState(false);

	useEffect(() => {
		const started = Date.now();
		let stopped = false;
		let timer: ReturnType<typeof setTimeout>;
		const check = async () => {
			const rapor = await getRaporOzeti(raporKey).catch(() => null);
			if (stopped) return;
			if (rapor?.hazir) {
				setReady(true);
				return;
			}
			if (Date.now() - started > GIVE_UP_MS) {
				setTimedOut(true);
				return;
			}
			timer = setTimeout(() => void check(), POLL_MS);
		};
		void check();
		return () => {
			stopped = true;
			clearTimeout(timer);
		};
	}, [raporKey]);

	if (!ready && !timedOut) {
		return (
			<View className="mt-3 flex-row items-center gap-2">
				<ActivityIndicator size="small" color="#2563eb" />
				<Text className="flex-1 text-slate-900 text-sm">
					Raporun hazırlanıyor, genellikle bir dakikadan kısa sürer…
				</Text>
			</View>
		);
	}

	const pdfUrl = raporPdfUrl(raporKey);
	const shareText = `KetaLearn ${denemeBaslik} deneme raporum: ${pdfUrl}`;

	return (
		<View className="mt-3 gap-3">
			{timedOut && !ready ? (
				<Text className="text-slate-500 text-sm">
					Hazırlanması biraz uzun sürüyor. Linki birkaç dakika sonra açabilirsin.
				</Text>
			) : null}
			<Pressable
				onPress={() => void Linking.openURL(pdfUrl)}
				className="flex-row items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 active:bg-blue-700"
			>
				<FileText size={18} color="#ffffff" />
				<Text className="font-bold text-sm text-white">PDF raporunu aç</Text>
			</Pressable>
			<Pressable
				onPress={() => void Linking.openURL(`https://wa.me/?text=${encodeURIComponent(shareText)}`)}
				className="flex-row items-center justify-center gap-2 rounded-xl bg-[#25D366] px-6 py-3.5 active:opacity-80"
			>
				<MessageCircle size={18} color="#ffffff" />
				<Text className="font-bold text-sm text-white">WhatsApp'ta paylaş</Text>
			</Pressable>
			<Link
				href={`/rapor/${encodeURIComponent(raporKey)}/veli`}
				className="flex-row items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3.5 active:bg-slate-50"
			>
				<Users size={18} color="#334155" />
				<Text className="font-bold text-slate-700 text-sm">Raporu velinle paylaş</Text>
			</Link>
			<Text className="text-slate-500 text-sm">
				Linki kaydetmek için kendine ya da veline WhatsApp'tan gönderebilirsin.
			</Text>
		</View>
	);
}
