import { useRouter } from 'expo-router';
import { Check, CheckCircle2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { RaporHazir } from '@/components/features/deneme/rapor-hazir';
import { DenemeApiError, requestReport, type Yakinlik } from '@/lib/deneme';
import { cn } from '@/lib/utils';

const YAKINLIK_OPTIONS: { value: Yakinlik; label: string }[] = [
	{ value: 'Veli', label: 'Veli' },
	{ value: 'Ogrenci', label: 'Öğrenci' },
	{ value: 'Diger', label: 'Diğer' },
];

const INPUT_CLASS =
	'rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900';

/** Collects the phone number the report link is sent to, then shows the waiting/ready panel. */
export function ReportRequestForm({
	sonucAnahtari,
	denemeBaslik,
	kaynak,
}: {
	sonucAnahtari: string;
	denemeBaslik: string;
	kaynak: string;
}) {
	const router = useRouter();
	const [adSoyad, setAdSoyad] = useState('');
	const [telefon, setTelefon] = useState('');
	const [yakinlik, setYakinlik] = useState<Yakinlik | null>(null);
	const [raporIzni, setRaporIzni] = useState(false);
	const [aramaIzni, setAramaIzni] = useState(false);
	const [sending, setSending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [raporKey, setRaporKey] = useState<string | null>(null);

	const submit = async () => {
		if (!adSoyad.trim() || !telefon.trim() || !raporIzni) {
			setError('Lütfen zorunlu alanları doldurun.');
			return;
		}
		if (!yakinlik) {
			setError('Numaranın kime ait olduğunu seçin.');
			return;
		}
		setSending(true);
		setError(null);
		try {
			const response = await requestReport(sonucAnahtari, {
				adSoyad: adSoyad.trim(),
				telefon: telefon.trim(),
				yakinlik,
				raporIzni,
				aramaIzni,
				kaynak,
			});
			setRaporKey(response.raporAnahtari);
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

	if (raporKey) {
		return (
			<View className="rounded-2xl border border-green-200 bg-green-50 p-5">
				<CheckCircle2 size={32} color="#15803d" />
				<Text className="mt-2 mb-2 font-bold text-slate-900 text-xl">Analiz raporun</Text>
				<RaporHazir raporKey={raporKey} denemeBaslik={denemeBaslik} />
				<Pressable
					onPress={() => router.push('/courses')}
					className="mt-4 self-start active:opacity-70"
				>
					<Text className="text-slate-600 text-sm underline">Derslere göz at</Text>
				</Pressable>
			</View>
		);
	}

	return (
		<View className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
			<Text className="font-bold text-slate-900 text-xl">Raporunu hazırlayalım</Text>
			<Text className="mt-1 text-slate-500 text-sm">
				Rapor birkaç saniye içinde burada açılır. Numarayı, Çağlar Hoca sonucu sizinle
				değerlendirebilsin diye istiyoruz. E-posta istemiyoruz.
			</Text>

			<View className="mt-4 gap-4">
				<View>
					<Text className="mb-1 font-medium text-slate-900 text-sm">
						Numara sahibinin adı soyadı
					</Text>
					<TextInput
						value={adSoyad}
						onChangeText={setAdSoyad}
						autoComplete="name"
						className={INPUT_CLASS}
					/>
				</View>
				<View>
					<Text className="mb-1 font-medium text-slate-900 text-sm">Cep telefonu</Text>
					<TextInput
						value={telefon}
						onChangeText={setTelefon}
						keyboardType="phone-pad"
						autoComplete="tel"
						placeholder="05xx xxx xx xx"
						placeholderTextColor="#94a3b8"
						className={INPUT_CLASS}
					/>
				</View>
				<View>
					<Text className="mb-1 font-medium text-slate-900 text-sm">Numara kime ait?</Text>
					<View className="flex-row flex-wrap gap-2">
						{YAKINLIK_OPTIONS.map((option) => {
							const selected = yakinlik === option.value;
							return (
								<Pressable
									key={option.value}
									onPress={() => setYakinlik(option.value)}
									className={cn(
										'rounded-full border px-4 py-1.5',
										selected
											? 'border-blue-600 bg-blue-600'
											: 'border-slate-300 bg-white active:bg-slate-50',
									)}
								>
									<Text
										className={cn(
											'text-sm',
											selected ? 'font-semibold text-white' : 'text-slate-700',
										)}
									>
										{option.label}
									</Text>
								</Pressable>
							);
						})}
					</View>
				</View>

				<Pressable
					onPress={() => setRaporIzni((value) => !value)}
					className="flex-row items-start gap-2.5"
				>
					<CheckBox checked={raporIzni} />
					<Text className="flex-1 text-slate-700 text-sm leading-5">
						Bilgilerimin rapor ve değerlendirme için işlenmesine ilişkin{' '}
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
						'items-center rounded-xl px-6 py-3.5',
						sending ? 'bg-slate-300' : 'bg-blue-600 active:bg-blue-700',
					)}
				>
					<Text className={cn('font-bold text-sm', sending ? 'text-slate-500' : 'text-white')}>
						{sending ? 'Hazırlanıyor...' : 'Raporumu hazırla'}
					</Text>
				</Pressable>
			</View>
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
