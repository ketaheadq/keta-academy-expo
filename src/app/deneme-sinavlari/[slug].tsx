import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import type { LucideIcon } from 'lucide-react-native';
import {
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	Clock,
	FileQuestion,
	Users,
} from 'lucide-react-native';
import { type ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { ReportRequestForm } from '@/components/features/deneme/report-request-form';
import { SampleReport } from '@/components/features/deneme/sample-report';
import { RichText } from '@/components/shared/rich-text';
import { EmptyState, LoadingState } from '@/components/shared/states';
import { useAsync } from '@/hooks/use-async';
import {
	ANALIZ_MADDELERI,
	DenemeApiError,
	type DenemeDetail,
	getDeneme,
	type Media,
	resolveMedia,
	SINAV_TURU_LABEL,
	type SonucOzeti,
	submitDeneme,
} from '@/lib/deneme';
import { cn, formatClock, formatNumberTR, generateUuid } from '@/lib/utils';

type Stage = 'intro' | 'running' | 'result';

export default function DenemeScreen() {
	const { slug } = useLocalSearchParams<{ slug: string }>();
	const router = useRouter();
	const { data, loading } = useAsync(() => getDeneme(slug), [slug]);

	if (loading) {
		return (
			<>
				<Stack.Screen options={{ title: 'Deneme Sınavları' }} />
				<LoadingState />
			</>
		);
	}

	if (!data) {
		return (
			<>
				<Stack.Screen options={{ title: 'Deneme bulunamadı' }} />
				<View className="flex-1 items-center justify-center bg-slate-50">
					<EmptyState
						title="Deneme bulunamadı"
						actionLabel="Deneme sınavlarına git"
						onAction={() => router.replace('/deneme-sinavlari')}
					/>
				</View>
			</>
		);
	}

	return <DenemeRunner deneme={data} />;
}

function DenemeRunner({ deneme }: { deneme: DenemeDetail }) {
	// Anonymous exam identity; the web app keeps this in sessionStorage, mobile per mount.
	const [oturumId] = useState(generateUuid);
	const [stage, setStage] = useState<Stage>('intro');
	const [startedAt, setStartedAt] = useState<number | null>(null);
	const [current, setCurrent] = useState(0);
	const [answers, setAnswers] = useState<Record<number, string | null>>({});
	const [now, setNow] = useState(() => Date.now());
	const [result, setResult] = useState<SonucOzeti | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const submittedRef = useRef(false);

	const total = deneme.sorular.length;
	const limitSeconds = deneme.sureDakika * 60;
	const remaining =
		startedAt !== null
			? Math.max(0, limitSeconds - Math.floor((now - startedAt) / 1000))
			: limitSeconds;

	const finish = useCallback(async () => {
		if (startedAt === null || submittedRef.current) return;
		submittedRef.current = true;
		setSubmitting(true);
		setSubmitError(null);
		try {
			const response = await submitDeneme(deneme.slug, {
				cevaplar: answers,
				oturumId,
				sureSaniye: Math.min(limitSeconds, Math.floor((Date.now() - startedAt) / 1000)),
				kaynak: 'mobil-uygulama',
				utm: null,
			});
			setResult(response);
			setStage('result');
		} catch (error) {
			submittedRef.current = false;
			setSubmitError(
				error instanceof DenemeApiError ? error.message : 'Bağlantı sorunu, lütfen tekrar deneyin.',
			);
		} finally {
			setSubmitting(false);
		}
	}, [answers, deneme.slug, limitSeconds, oturumId, startedAt]);

	useEffect(() => {
		if (stage !== 'running') return;
		const timer = setInterval(() => setNow(Date.now()), 1000);
		return () => clearInterval(timer);
	}, [stage]);

	useEffect(() => {
		if (stage === 'running' && startedAt !== null && remaining === 0) void finish();
	}, [stage, startedAt, remaining, finish]);

	const start = () => {
		setAnswers({});
		setCurrent(0);
		setSubmitError(null);
		setStartedAt(Date.now());
		setNow(Date.now());
		setStage('running');
	};

	const eyebrow = [SINAV_TURU_LABEL[deneme.sinavTuru], deneme.sinif?.title, deneme.ders?.title]
		.filter(Boolean)
		.join(' · ');

	const heading = (
		<View className="px-4 pt-4">
			<Text className="font-medium text-blue-600 text-sm">{eyebrow}</Text>
			<Text className="mt-1 font-bold text-2xl text-slate-900">{deneme.baslik}</Text>
			{deneme.aciklama ? (
				<Text className="mt-2 text-base text-slate-500 leading-relaxed">{deneme.aciklama}</Text>
			) : null}
		</View>
	);

	return (
		<>
			<Stack.Screen options={{ title: deneme.baslik }} />
			{stage === 'intro' ? (
				<ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 16 }}>
					{heading}
					<View className="gap-4 p-4">
						<View className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
							<View className="flex-row gap-3">
								<Stat icon={FileQuestion} value={`${deneme.soruSayisi}`} label="soru" />
								<Stat icon={Clock} value={`${deneme.sureDakika} dk`} label="süre" />
								{deneme.cozenSayisi !== null ? (
									<Stat
										icon={Users}
										value={formatNumberTR(deneme.cozenSayisi)}
										label="öğrenci çözdü"
									/>
								) : null}
							</View>
							{deneme.konular.length > 0 ? (
								<View className="mt-5">
									<Text className="mb-2 font-semibold text-slate-900">Kapsadığı konular</Text>
									<View className="flex-row flex-wrap gap-2">
										{deneme.konular.map((konu) => (
											<View key={konu.slug} className="rounded-full bg-blue-50 px-3 py-1">
												<Text className="text-blue-700 text-sm">{konu.ad}</Text>
											</View>
										))}
									</View>
								</View>
							) : null}
							<Pressable
								onPress={start}
								className="mt-6 items-center rounded-xl bg-blue-600 px-6 py-3.5 active:bg-blue-700"
							>
								<Text className="font-bold text-sm text-white">Kayıt gerekmez, hemen başla</Text>
							</Pressable>
							<Text className="mt-2 text-slate-500 text-sm">
								Süre başla dediğinde başlar. Bitirince netin hemen görünür.
							</Text>
						</View>
						<SampleReport />
					</View>
				</ScrollView>
			) : stage === 'running' ? (
				<RunningStage
					deneme={deneme}
					heading={heading}
					current={current}
					answers={answers}
					answered={Object.values(answers).filter(Boolean).length}
					total={total}
					remaining={remaining}
					submitting={submitting}
					submitError={submitError}
					onChoose={(letter) =>
						setAnswers((prev) => ({
							...prev,
							[current]: prev[current] === letter ? null : letter,
						}))
					}
					onGo={(index) => setCurrent(Math.min(total - 1, Math.max(0, index)))}
					onFinish={() => void finish()}
				/>
			) : result ? (
				<ResultStage deneme={deneme} heading={heading} result={result} />
			) : null}
		</>
	);
}

function RunningStage({
	deneme,
	heading,
	current,
	answers,
	answered,
	total,
	remaining,
	submitting,
	submitError,
	onChoose,
	onGo,
	onFinish,
}: {
	deneme: DenemeDetail;
	heading: ReactElement;
	current: number;
	answers: Record<number, string | null>;
	answered: number;
	total: number;
	remaining: number;
	submitting: boolean;
	submitError: string | null;
	onChoose: (letter: string) => void;
	onGo: (index: number) => void;
	onFinish: () => void;
}) {
	const question = deneme.sorular[current];
	const urgent = remaining <= 60;

	return (
		<ScrollView
			className="flex-1 bg-slate-50"
			contentContainerStyle={{ paddingBottom: 16 }}
			stickyHeaderIndices={[1]}
		>
			{heading}
			<View className="flex-row items-center justify-between gap-3 border-slate-200 border-b bg-white px-4 py-3">
				<View className="flex-1 flex-row items-center gap-2">
					<Text className="font-semibold text-slate-900 text-sm">
						Soru {current + 1}/{total}
					</Text>
					<Text className="text-slate-500 text-sm">{answered} cevaplandı</Text>
				</View>
				<View
					className={cn(
						'flex-row items-center gap-1 rounded-full px-3 py-1',
						urgent ? 'bg-red-50' : 'bg-blue-50',
					)}
				>
					<Clock size={14} color={urgent ? '#dc2626' : '#2563eb'} />
					<Text
						className={cn(
							'font-mono font-semibold text-sm',
							urgent ? 'text-red-600' : 'text-blue-600',
						)}
					>
						{formatClock(remaining)}
					</Text>
				</View>
			</View>

			{question ? (
				<View className="gap-4 p-4">
					<View className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
						<Text className="font-semibold text-slate-500 text-sm">{question.no}. soru</Text>
						<View className="mt-3">
							<RichText blocks={question.metin} />
						</View>
						{question.gorsel ? <MediaImage media={question.gorsel} className="mt-1" /> : null}

						<View className="mt-3 gap-2">
							{question.secenekler.map((secenek) => {
								const selected = answers[current] === secenek.harf;
								return (
									<Pressable
										key={secenek.harf}
										onPress={() => onChoose(secenek.harf)}
										className={cn(
											'flex-row items-start gap-3 rounded-xl border-2 p-3',
											selected
												? 'border-blue-600 bg-blue-50'
												: 'border-slate-200 bg-white active:bg-slate-50',
										)}
									>
										<View
											className={cn(
												'size-7 shrink-0 items-center justify-center rounded-full',
												selected ? 'bg-blue-600' : 'bg-slate-100',
											)}
										>
											<Text
												className={cn(
													'font-bold text-sm',
													selected ? 'text-white' : 'text-slate-900',
												)}
											>
												{secenek.harf}
											</Text>
										</View>
										<View className="flex-1">
											<Text className="text-base text-slate-900 leading-6">{secenek.metin}</Text>
											{secenek.gorsel ? (
												<MediaImage media={secenek.gorsel} className="mt-2" />
											) : null}
										</View>
									</Pressable>
								);
							})}
						</View>
						<Text className="mt-2 text-slate-500 text-xs">
							Seçili şıkka tekrar dokunursan soru boş kalır.
						</Text>

						<View className="mt-6 flex-row items-center justify-between gap-2">
							<Pressable
								onPress={() => onGo(current - 1)}
								disabled={current === 0}
								className={cn(
									'flex-row items-center gap-1 rounded-xl border px-4 py-2.5',
									current === 0
										? 'border-slate-100 bg-slate-50'
										: 'border-slate-300 bg-white active:bg-slate-50',
								)}
							>
								<ChevronLeft size={16} color={current === 0 ? '#cbd5e1' : '#334155'} />
								<Text
									className={cn(
										'font-semibold text-sm',
										current === 0 ? 'text-slate-300' : 'text-slate-700',
									)}
								>
									Önceki
								</Text>
							</Pressable>
							{current < total - 1 ? (
								<Pressable
									onPress={() => onGo(current + 1)}
									className="flex-row items-center gap-1 rounded-xl bg-blue-600 px-4 py-2.5 active:bg-blue-700"
								>
									<Text className="font-semibold text-sm text-white">Sonraki</Text>
									<ChevronRight size={16} color="#ffffff" />
								</Pressable>
							) : (
								<Pressable
									onPress={onFinish}
									disabled={submitting}
									className={cn(
										'rounded-xl px-4 py-2.5',
										submitting ? 'bg-slate-300' : 'bg-blue-600 active:bg-blue-700',
									)}
								>
									<Text
										className={cn(
											'font-semibold text-sm',
											submitting ? 'text-slate-500' : 'text-white',
										)}
									>
										{submitting ? 'Gönderiliyor...' : 'Sınavı bitir'}
									</Text>
								</Pressable>
							)}
						</View>
					</View>

					<View className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
						<View className="flex-row flex-wrap gap-2">
							{deneme.sorular.map((soru, index) => {
								const isAnswered = Boolean(answers[index]);
								const isCurrent = index === current;
								return (
									<Pressable
										key={soru.no}
										onPress={() => onGo(index)}
										accessibilityLabel={`${soru.no}. soru${isAnswered ? ', cevaplandı' : ''}`}
										className={cn(
											'size-9 items-center justify-center rounded-lg border-2',
											isCurrent
												? 'border-slate-900'
												: isAnswered
													? 'border-blue-600'
													: 'border-slate-200',
											isAnswered ? 'bg-blue-600' : 'bg-white',
										)}
									>
										<Text
											className={cn(
												'font-medium text-sm',
												isAnswered ? 'text-white' : 'text-slate-700',
											)}
										>
											{soru.no}
										</Text>
									</Pressable>
								);
							})}
						</View>
						<View className="mt-4 flex-row flex-wrap items-center justify-between gap-3">
							<Text className="text-slate-500 text-sm">
								{total - answered > 0
									? `${total - answered} soru boş.`
									: 'Bütün sorular cevaplandı.'}
							</Text>
							<Pressable
								onPress={onFinish}
								disabled={submitting}
								className={cn(
									'rounded-xl px-4 py-2.5',
									submitting ? 'bg-slate-200' : 'bg-slate-100 active:bg-slate-200',
								)}
							>
								<Text
									className={cn(
										'font-semibold text-sm',
										submitting ? 'text-slate-400' : 'text-slate-900',
									)}
								>
									{submitting ? 'Gönderiliyor...' : 'Sınavı bitir'}
								</Text>
							</Pressable>
						</View>
						{submitError ? <Text className="mt-3 text-red-600 text-sm">{submitError}</Text> : null}
					</View>
				</View>
			) : null}
		</ScrollView>
	);
}

function ResultStage({
	deneme,
	heading,
	result,
}: {
	deneme: DenemeDetail;
	heading: ReactElement;
	result: SonucOzeti;
}) {
	const router = useRouter();
	const [choice, setChoice] = useState<'ask' | 'yes' | 'no'>('ask');

	return (
		<ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 16 }}>
			{heading}
			<View className="gap-4 p-4">
				<View className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
					<Text className="font-bold text-2xl text-slate-900">Sonucun</Text>
					<View className="mt-4 flex-row gap-3">
						<ResultStat label="Net" value={formatNumberTR(result.net)} highlight />
						<ResultStat label="Doğru" value={result.dogru} />
						<ResultStat label="Yanlış" value={result.yanlis} />
						<ResultStat label="Boş" value={result.bos} />
					</View>
				</View>

				<View className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
					<Text className="font-bold text-slate-900 text-xl">
						Geniş analiz raporunu ister misin?
					</Text>
					<Text className="mt-1 text-slate-600 text-sm">
						Ücretsiz. Sonuçlarını Çağlar Hoca'nın gözünden inceleyip PDF olarak hemen burada
						hazırlıyoruz.
					</Text>
					<View className="mt-3 gap-1.5">
						{ANALIZ_MADDELERI.map((item) => (
							<View key={item} className="flex-row gap-2">
								<View className="mt-0.5 shrink-0">
									<CheckCircle2 size={16} color="#2563eb" />
								</View>
								<Text className="flex-1 text-slate-900 text-sm">{item}</Text>
							</View>
						))}
					</View>

					{choice === 'ask' ? (
						<View className="mt-5 gap-3">
							<Pressable
								onPress={() => setChoice('yes')}
								className="items-center rounded-xl bg-blue-600 px-6 py-3.5 active:bg-blue-700"
							>
								<Text className="font-bold text-sm text-white">Evet, raporu istiyorum</Text>
							</Pressable>
							<Pressable
								onPress={() => setChoice('no')}
								className="items-center rounded-xl border border-slate-300 bg-white px-6 py-3.5 active:bg-slate-50"
							>
								<Text className="font-bold text-slate-900 text-sm">Hayır, teşekkürler</Text>
							</Pressable>
						</View>
					) : null}

					{choice === 'no' ? (
						<View className="mt-5 flex-row flex-wrap items-center gap-3">
							<Pressable
								onPress={() => router.push('/courses')}
								className="rounded-xl bg-blue-600 px-4 py-2.5 active:bg-blue-700"
							>
								<Text className="font-bold text-sm text-white">Derslere göz at</Text>
							</Pressable>
							<Pressable
								onPress={() => router.push('/deneme-sinavlari')}
								className="active:opacity-70"
							>
								<Text className="text-slate-600 text-sm underline">Başka bir deneme çöz</Text>
							</Pressable>
							<Pressable onPress={() => setChoice('yes')} className="active:opacity-70">
								<Text className="text-blue-600 text-sm underline">
									Fikrimi değiştirdim, raporu istiyorum
								</Text>
							</Pressable>
						</View>
					) : null}
				</View>

				{choice === 'yes' ? (
					<ReportRequestForm
						sonucAnahtari={result.sonucAnahtari}
						denemeBaslik={deneme.baslik}
						kaynak="mobil-uygulama"
					/>
				) : null}

				<SampleReport />
			</View>
		</ScrollView>
	);
}

function MediaImage({ media, className }: { media: Media; className?: string }) {
	const resolved = resolveMedia(media);
	if (!resolved?.url) return null;
	return (
		<View className={className}>
			<Image
				source={{ uri: resolved.url }}
				accessibilityLabel={resolved.alt}
				resizeMode="contain"
				style={{
					width: '100%',
					aspectRatio: (resolved.width ?? 800) / (resolved.height ?? 450),
					borderRadius: 8,
				}}
			/>
		</View>
	);
}

function Stat({ icon: Icon, value, label }: { icon: LucideIcon; value: string; label: string }) {
	return (
		<View className="flex-1 items-center rounded-xl bg-slate-100 p-3">
			<Icon size={16} color="#2563eb" />
			<Text className="mt-1 font-bold text-lg text-slate-900">{value}</Text>
			<Text className="text-center text-slate-500 text-xs">{label}</Text>
		</View>
	);
}

function ResultStat({
	label,
	value,
	highlight,
}: {
	label: string;
	value: string | number;
	highlight?: boolean;
}) {
	return (
		<View
			className={cn(
				'flex-1 items-center rounded-xl p-3',
				highlight ? 'bg-blue-600' : 'bg-slate-100',
			)}
		>
			<Text className={cn('font-bold text-xl', highlight ? 'text-white' : 'text-slate-900')}>
				{value}
			</Text>
			<Text className={cn('text-xs', highlight ? 'text-blue-100' : 'text-slate-500')}>{label}</Text>
		</View>
	);
}
