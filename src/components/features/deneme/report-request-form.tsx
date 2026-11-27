import { useRouter } from 'expo-router';
import { Check, CheckCircle2 } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { RaporHazir } from '@/components/features/deneme/rapor-hazir';
import { DenemeApiError, requestReport, type Yakinlik } from '@/lib/deneme';
import { useThemeColors } from '@/lib/theme';
import { cn, toInternationalDigits } from '@/lib/utils';

const YAKINLIK_OPTIONS: { value: Yakinlik; label: string }[] = [
	{ value: 'Veli', label: 'Veli' },
	{ value: 'Ogrenci', label: 'Öğrenci' },
	{ value: 'Diger', label: 'Diğer' },
];

const INPUT_CLASS = 'rounded-lg border border-input bg-card px-3 py-2.5 text-base text-foreground';

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
	const colors = useThemeColors();
	const [adSoyad, setAdSoyad] = useState('');
	const [telefon, setTelefon] = useState('');
	const [yakinlik, setYakinlik] = useState<Yakinlik | null>(null);
	const [raporIzni, setRaporIzni] = useState(false);
	const [aramaIzni, setAramaIzni] = useState(false);
	const [sending, setSending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [raporKey, setRaporKey] = useState<string | null>(null);

	const submit = async () => {
		// Field-specific messages: the generic one left users guessing which box they missed.
		if (!adSoyad.trim()) {
			setError('Lütfen numara sahibinin adını ve soyadını yazın.');
			return;
		}
		if (!toInternationalDigits(telefon)) {
			setError('Lütfen geçerli bir cep telefonu numarası yazın (05xx xxx xx xx).');
			return;
		}
		if (!raporIzni) {
			setError('Devam etmek için KVKK onayı gerekiyor.');
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
			<View className="rounded-2xl border border-success/30 bg-success/10 p-5">
				<CheckCircle2 size={32} color={colors.success} />
				<Text className="mt-2 mb-2 font-bold text-foreground text-xl">Analiz raporun</Text>
				<RaporHazir raporKey={raporKey} denemeBaslik={denemeBaslik} />
				<Pressable
					onPress={() => router.push('/courses')}
					className="mt-4 self-start active:opacity-70"
				>
					<Text className="text-muted-foreground text-sm underline">Derslere göz at</Text>
				</Pressable>
			</View>
		);
	}

	return (
		<View className="rounded-2xl border border-border bg-card p-5 shadow-sm">
			<Text className="font-bold text-foreground text-xl">Raporunu hazırlayalım</Text>
			<Text className="mt-1 text-muted-foreground text-sm">
				Rapor birkaç saniye içinde burada açılır. Numarayı, Çağlar Hoca sonucu sizinle
				değerlendirebilsin diye istiyoruz. E-posta istemiyoruz.
			</Text>

			<View className="mt-4 gap-4">
				<View>
					<Text className="mb-1 font-medium text-foreground text-sm">
						Numara sahibinin adı soyadı
					</Text>
					<TextInput
						value={adSoyad}
						onChangeText={setAdSoyad}
						accessibilityLabel="Numara sahibinin adı soyadı"
						autoComplete="name"
						className={INPUT_CLASS}
					/>
				</View>
				<View>
					<Text className="mb-1 font-medium text-foreground text-sm">Cep telefonu</Text>
					<TextInput
						value={telefon}
						onChangeText={setTelefon}
						accessibilityLabel="Cep telefonu"
						keyboardType="phone-pad"
						autoComplete="tel"
						placeholder="05xx xxx xx xx"
						placeholderTextColor={colors.mutedForeground}
						className={INPUT_CLASS}
					/>
				</View>
				<View>
					<Text className="mb-1 font-medium text-foreground text-sm">Numara kime ait?</Text>
					<View
						accessibilityRole="radiogroup"
						accessibilityLabel="Numara kime ait?"
						className="flex-row flex-wrap gap-2"
					>
						{YAKINLIK_OPTIONS.map((option) => {
							const selected = yakinlik === option.value;
							return (
								<Pressable
									key={option.value}
									accessibilityRole="radio"
									accessibilityState={{ checked: selected }}
									aria-checked={selected}
									onPress={() => setYakinlik(option.value)}
									className={cn(
										'rounded-full border px-4 py-1.5',
										selected
											? 'border-accent bg-accent'
											: 'border-input bg-card active:bg-accent/10',
									)}
								>
									<Text
										className={cn(
											'text-sm',
											selected ? 'font-semibold text-accent-foreground' : 'text-foreground',
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
					accessibilityRole="checkbox"
					accessibilityLabel="Rapor ve değerlendirme için KVKK onayı"
					accessibilityState={{ checked: raporIzni }}
					aria-checked={raporIzni}
					onPress={() => setRaporIzni((value) => !value)}
					className="flex-row items-start gap-2.5"
				>
					<CheckBox checked={raporIzni} />
					<Text className="flex-1 text-foreground text-sm leading-5">
						Bilgilerimin rapor ve değerlendirme için işlenmesine ilişkin{' '}
						<Text
							className="text-primary underline"
							onPress={() => router.push('/gizlilik-politikasi')}
						>
							KVKK aydınlatma metnini
						</Text>{' '}
						okudum, onaylıyorum.
					</Text>
				</Pressable>

				<Pressable
					accessibilityRole="checkbox"
					accessibilityLabel="Rapor hakkında bilgi ve kampanya iletişimi izni"
					accessibilityState={{ checked: aramaIzni }}
					aria-checked={aramaIzni}
					onPress={() => setAramaIzni((value) => !value)}
					className="flex-row items-start gap-2.5"
				>
					<CheckBox checked={aramaIzni} />
					<Text className="flex-1 text-foreground text-sm leading-5">
						Rapor hakkında bilgi verilmesi ve kampanyalar için bu numaradan aranmak ve mesaj almak
						istiyorum.
					</Text>
				</Pressable>

				{error ? <Text className="text-destructive text-sm">{error}</Text> : null}

				<Pressable
					onPress={() => void submit()}
					disabled={sending}
					className={cn(
						'items-center rounded-xl px-6 py-3.5',
						sending ? 'bg-muted' : 'bg-primary active:opacity-80',
					)}
				>
					<Text
						className={cn(
							'font-bold text-sm',
							sending ? 'text-muted-foreground' : 'text-primary-foreground',
						)}
					>
						{sending ? 'Hazırlanıyor...' : 'Raporumu hazırla'}
					</Text>
				</Pressable>
			</View>
		</View>
	);
}

function CheckBox({ checked }: { checked: boolean }) {
	const colors = useThemeColors();

	return (
		<View
			className={cn(
				'mt-0.5 size-5 shrink-0 items-center justify-center rounded border-2',
				checked ? 'border-accent bg-accent' : 'border-input bg-card',
			)}
		>
			{checked ? <Check size={14} color={colors.accentForeground} strokeWidth={3} /> : null}
		</View>
	);
}
