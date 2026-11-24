import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { addParentNumber, DenemeApiError } from '@/lib/deneme';
import { cn } from '@/lib/utils';

const INPUT_CLASS =
	'rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900';

/**
 * Adds a parent's number to an existing report so Çağlar Hoca can walk them through it. The
 * success panel is rendered by the parent screen via `onSuccess`; the form then hides itself.
 */
export function VeliForm({
	raporAnahtari,
	kaynak,
	onSuccess,
}: {
	raporAnahtari: string;
	kaynak: string;
	onSuccess?: () => void;
}) {
	const router = useRouter();
	const [adSoyad, setAdSoyad] = useState('');
	const [telefon, setTelefon] = useState('');
	const [raporIzni, setRaporIzni] = useState(false);
	const [aramaIzni, setAramaIzni] = useState(false);
	const [sending, setSending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [sent, setSent] = useState(false);

	const submit = async () => {
		if (!adSoyad.trim() || !telefon.trim() || !raporIzni) {
			setError('Lütfen zorunlu alanları doldurun.');
			return;
		}
		setSending(true);
		setError(null);
		try {
			await addParentNumber(raporAnahtari, {
				adSoyad: adSoyad.trim(),
				telefon: telefon.trim(),
				raporIzni,
				aramaIzni,
				kaynak,
			});
			setSent(true);
			onSuccess?.();
		} catch (cause) {
			setError(
				cause instanceof DenemeApiError
					? cause.message
					: 'Bir sorun oluştu, lütfen tekrar deneyin.',
			);
		} finally {
			setSending(false);
		}
	};

	if (sent) return null;

	return (
		<View className="gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<TextInput
				value={adSoyad}
				onChangeText={setAdSoyad}
				placeholder="Velinin adı soyadı"
				accessibilityLabel="Velinin adı soyadı"
				autoComplete="name"
				placeholderTextColor="#94a3b8"
				className={INPUT_CLASS}
			/>
			<TextInput
				value={telefon}
				onChangeText={setTelefon}
				placeholder="05xx xxx xx xx"
				accessibilityLabel="Velinin cep telefonu"
				keyboardType="phone-pad"
				autoComplete="tel"
				placeholderTextColor="#94a3b8"
				className={INPUT_CLASS}
			/>

			<Pressable
				onPress={() => setRaporIzni((value) => !value)}
				className="flex-row items-start gap-2.5"
			>
				<CheckBox checked={raporIzni} />
				<Text className="flex-1 text-slate-700 text-sm leading-5">
					Bilgilerin rapor ve değerlendirme için işlenmesine ilişkin{' '}
					<Text
						className="text-blue-600 underline"
						onPress={() => router.push('/gizlilik-politikasi')}
					>
						KVKK aydınlatma metnini
					</Text>{' '}
					okudum, onaylıyorum.
				</Text>
			</Pressable>

			<Pressable
				onPress={() => setAramaIzni((value) => !value)}
				className="flex-row items-start gap-2.5"
			>
				<CheckBox checked={aramaIzni} />
				<Text className="flex-1 text-slate-700 text-sm leading-5">
					Rapor hakkında bilgi verilmesi ve kampanyalar için bu numaradan aranmak ve mesaj almak
					istiyorum.
				</Text>
			</Pressable>

			{error ? <Text className="text-red-600 text-sm">{error}</Text> : null}

			<Pressable
				onPress={() => void submit()}
				disabled={sending}
				className={cn(
					'items-center rounded-xl px-6 py-3',
					sending ? 'bg-slate-300' : 'bg-blue-600 active:bg-blue-700',
				)}
			>
				<Text className={cn('font-bold text-sm', sending ? 'text-slate-500' : 'text-white')}>
					{sending ? 'Gönderiliyor...' : 'Veliye gönder'}
				</Text>
			</Pressable>
		</View>
	);
}

function CheckBox({ checked }: { checked: boolean }) {
	return (
		<View
			className={cn(
				'mt-0.5 size-5 shrink-0 items-center justify-center rounded border-2',
				checked ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white',
			)}
		>
			{checked ? <Check size={14} color="#ffffff" strokeWidth={3} /> : null}
		</View>
	);
}
