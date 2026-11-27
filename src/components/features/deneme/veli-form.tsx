import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { addParentNumber, DenemeApiError } from '@/lib/deneme';
import { useThemeColors } from '@/lib/theme';
import { cn, toInternationalDigits } from '@/lib/utils';

const INPUT_CLASS = 'rounded-lg border border-input bg-card px-3 py-2.5 text-base text-foreground';

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
	const colors = useThemeColors();
	const [adSoyad, setAdSoyad] = useState('');
	const [telefon, setTelefon] = useState('');
	const [raporIzni, setRaporIzni] = useState(false);
	const [aramaIzni, setAramaIzni] = useState(false);
	const [sending, setSending] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [sent, setSent] = useState(false);

	const submit = async () => {
		// Field-specific messages: the generic one left users guessing which box they missed.
		if (!adSoyad.trim()) {
			setError('Lütfen velinin adını ve soyadını yazın.');
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
		<View className="gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm">
			<TextInput
				value={adSoyad}
				onChangeText={setAdSoyad}
				placeholder="Velinin adı soyadı"
				accessibilityLabel="Velinin adı soyadı"
				autoComplete="name"
				placeholderTextColor={colors.mutedForeground}
				className={INPUT_CLASS}
			/>
			<TextInput
				value={telefon}
				onChangeText={setTelefon}
				placeholder="05xx xxx xx xx"
				accessibilityLabel="Velinin cep telefonu"
				keyboardType="phone-pad"
				autoComplete="tel"
				placeholderTextColor={colors.mutedForeground}
				className={INPUT_CLASS}
			/>

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
					Bilgilerin rapor ve değerlendirme için işlenmesine ilişkin{' '}
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
					'items-center rounded-xl px-6 py-3',
					sending ? 'bg-muted' : 'bg-primary active:opacity-80',
				)}
			>
				<Text
					className={cn(
						'font-bold text-sm',
						sending ? 'text-muted-foreground' : 'text-primary-foreground',
					)}
				>
					{sending ? 'Gönderiliyor...' : 'Veliye gönder'}
				</Text>
			</Pressable>
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
