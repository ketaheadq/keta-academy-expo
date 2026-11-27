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
import { Reveal } from '@/components/shared/motion';
import { RichText } from '@/components/shared/rich-text';
import { EmptyState, ErrorState, LoadingState } from '@/components/shared/states';
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
import { secureStorage } from '@/lib/storage';
import { useThemeColors } from '@/lib/theme';
import { cn, formatClock, formatNumberTR, generateUuid } from '@/lib/utils';

type Stage = 'intro' | 'running' | 'result';

type ExamDraft = {
	oturumId: string;
	startedAt: number;
	current: number;
	answers: Record<number, string | null>;
};

const examDraftKey = (slug: string) => `deneme-draft:${encodeURIComponent(slug)}`;

function parseExamDraft(value: string | null, questionCount: number): ExamDraft | null {
	if (!value || !questionCount) return null;
	try {
		const draft = JSON.parse(value) as Partial<ExamDraft>;
		if (
			typeof draft.oturumId !== 'string' ||
			!draft.oturumId ||
			typeof draft.startedAt !== 'number' ||
			!Number.isFinite(draft.startedAt) ||
			typeof draft.current !== 'number' ||
			!Number.isInteger(draft.current) ||
			draft.current < 0 ||
			draft.current >= questionCount ||
			!draft.answers ||
			typeof draft.answers !== 'object' ||
			Array.isArray(draft.answers) ||
			!Object.values(draft.answers).every((answer) => answer === null || typeof answer === 'string')
		) {
			return null;
		}
		return draft as ExamDraft;
	} catch {
		return null;
	}
}

export default function DenemeScreen() {
	const { slug } = useLocalSearchParams<{ slug: string }>();
	const router = useRouter();
	const { data, loading, error, reload } = useAsync(() => getDeneme(slug), [slug]);

	if (loading) {
		return (
			<>
				<Stack.Screen options={{ title: 'Deneme Sınavları' }} />
				<LoadingState />
			</>
		);
	}

	if (error) {
		return (
			<>
				<Stack.Screen options={{ title: 'Deneme yüklenemedi' }} />
				<ErrorState message={error} onRetry={reload} />
			</>
		);
	}

	if (!data) {
		return (
			<>
				<Stack.Screen options={{ title: 'Deneme bulunamadı' }} />
				<View className="flex-1 items-center justify-center bg-background">
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
	const [oturumId, setOturumId] = useState(generateUuid);
	const [stage, setStage] = useState<Stage>('intro');
	const [startedAt, setStartedAt] = useState<number | null>(null);
	const [current, setCurrent] = useState(0);
	const [answers, setAnswers] = useState<Record<number, string | null>>({});
	const [now, setNow] = useState(() => Date.now());
	const [result, setResult] = useState<SonucOzeti | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [draftReady, setDraftReady] = useState(false);
	const submittedRef = useRef(false);

	const total = deneme.sorular.length;
	const limitSeconds = deneme.sureDakika * 60;
	const remaining =
		startedAt !== null
			? Math.max(0, limitSeconds - Math.floor((now - startedAt) / 1000))
			: limitSeconds;

	useEffect(() => {
		let active = true;
		const key = examDraftKey(deneme.slug);
		setDraftReady(false);
		void (async () => {
			try {
				const stored = await secureStorage.getItem(key);
				const draft = parseExamDraft(stored, total);
				if (!active) return;
				if (draft) {
					setOturumId(draft.oturumId);
					setStartedAt(draft.startedAt);
					setCurrent(draft.current);
					setAnswers(draft.answers);
					setNow(Date.now());
					setStage('running');
				} else if (stored) {
					await secureStorage.removeItem(key);
				}
			} catch (error) {
				console.error('Failed to restore exam draft:', error);
			} finally {
				if (active) setDraftReady(true);
			}
		})();
		return () => {
			active = false;
		};
	}, [deneme.slug, total]);

	useEffect(() => {
		if (!draftReady || stage !== 'running' || startedAt === null || result) return;
		void Promise.resolve(
			secureStorage.setItem(
				examDraftKey(deneme.slug),
				JSON.stringify({ oturumId, startedAt, current, answers } satisfies ExamDraft),
			),
		).catch((error) => console.error('Failed to save exam draft:', error));
	}, [answers, current, deneme.slug, draftReady, oturumId, result, stage, startedAt]);

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
			try {
				await secureStorage.removeItem(examDraftKey(deneme.slug));
			} catch (error) {
				console.error('Failed to clear exam draft:', error);
			}
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
		submittedRef.current = false;
		setOturumId(generateUuid());
		setAnswers({});
		setCurrent(0);
		setSubmitError(null);
		setStartedAt(Date.now());
		setNow(Date.now());
		setStage('running');
	};

	if (!draftReady) {
		return (
			<>
				<Stack.Screen options={{ title: deneme.baslik }} />
				<LoadingState label="Sınav hazırlanıyor..." />
			</>
		);
	}

	const eyebrow = [SINAV_TURU_LABEL[deneme.sinavTuru], deneme.sinif?.title, deneme.ders?.title]
		.filter(Boolean)
		.join(' · ');

	const heading = (
		<Reveal delay={20} distance={10}>
			<View className="px-4 pt-4">
				<Text className="font-medium text-primary text-sm">{eyebrow}</Text>
				<Text className="mt-1 font-bold text-2xl text-foreground">{deneme.baslik}</Text>
				{deneme.aciklama ? (
					<Text className="mt-2 text-base text-muted-foreground leading-relaxed">
						{deneme.aciklama}
					</Text>
				) : null}
			</View>
		</Reveal>
	);

	return (
		<>
			<Stack.Screen options={{ title: deneme.baslik }} />
			{stage === 'intro' ? (
				<ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 16 }}>
					{heading}
					<View className="gap-4 p-4">
						<Reveal delay={70}>
							<View className="rounded-2xl border border-border bg-card p-5 shadow-black/5 shadow-sm">
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
										<Text className="mb-2 font-semibold text-foreground">Kapsadığı konular</Text>
										<View className="flex-row flex-wrap gap-2">
											{deneme.konular.map((konu) => (
												<View key={konu.slug} className="rounded-full bg-accent px-3 py-1">
													<Text className="text-primary text-sm">{konu.ad}</Text>
												</View>
											))}
										</View>
									</View>
								) : null}
								<Pressable
									onPress={start}
									className="mt-6 items-center rounded-xl bg-primary px-6 py-3.5 active:bg-primary/90"
								>
									<Text className="font-bold text-primary-foreground text-sm">
										Kayıt gerekmez, hemen başla
									</Text>
								</Pressable>
								<Text className="mt-2 text-muted-foreground text-sm">
									Süre başla dediğinde başlar. Bitirince netin hemen görünür.
								</Text>
							</View>
						</Reveal>
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
					onChoose={(letter) => {
						if (submitting) return;
						setAnswers((prev) => ({
							...prev,
							[current]: prev[current] === letter ? null : letter,
						}));
					}}
					onGo={(index) => {
						if (!submitting) setCurrent(Math.min(total - 1, Math.max(0, index)));
					}}
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
	const colors = useThemeColors();
	const question = deneme.sorular[current];
	const urgent = remaining <= 60;

	return (
		<ScrollView
			className="flex-1 bg-background"
			contentContainerStyle={{ paddingBottom: 16 }}
			stickyHeaderIndices={[1]}
			pointerEvents={submitting ? 'none' : 'auto'}
		>
			{heading}
			<View className="flex-row items-center justify-between gap-3 border-border border-b bg-card px-4 py-3">
				<View className="flex-1 flex-row items-center gap-2">
					<Text className="font-semibold text-foreground text-sm">
						Soru {current + 1}/{total}
					</Text>
					<Text className="text-muted-foreground text-sm">{answered} cevaplandı</Text>
				</View>
				<View
					className={cn(
						'flex-row items-center gap-1 rounded-full px-3 py-1',
						urgent ? 'bg-destructive/10' : 'bg-accent',
					)}
				>
					<Clock size={14} color={urgent ? colors.destructive : colors.primary} />
					<Text
						className={cn(
							'font-mono font-semibold text-sm',
							urgent ? 'text-destructive' : 'text-primary',
						)}
					>
						{formatClock(remaining)}
					</Text>
				</View>
			</View>

			{question ? (
				<View className="gap-4 p-4">
					<Reveal key={current} delay={0} distance={10}>
						<View className="rounded-2xl border border-border bg-card p-4 shadow-black/5 shadow-sm">
							<Text className="font-semibold text-muted-foreground text-sm">
								{question.no}. soru
							</Text>
							<View className="mt-3">
								<RichText blocks={question.metin} />
							</View>
							{question.gorsel ? <MediaImage media={question.gorsel} className="mt-1" /> : null}

							<View
								accessibilityRole="radiogroup"
								accessibilityLabel={`${current + 1}. soru seçenekleri`}
								className="mt-3 gap-2"
							>
								{question.secenekler.map((secenek) => {
									const selected = answers[current] === secenek.harf;
									return (
										<Pressable
											key={secenek.harf}
											accessibilityRole="radio"
											accessibilityLabel={`${secenek.harf}. ${secenek.metin}`}
											accessibilityState={{ checked: selected }}
											aria-checked={selected}
											onPress={() => onChoose(secenek.harf)}
											className={cn(
												'flex-row items-start gap-3 rounded-xl border-2 p-3',
												selected
													? 'border-primary bg-accent'
													: 'border-input bg-card active:bg-muted',
											)}
										>
											<View
												className={cn(
													'size-7 shrink-0 items-center justify-center rounded-full',
													selected ? 'bg-primary' : 'bg-muted',
												)}
											>
												<Text
													className={cn(
														'font-bold text-sm',
														selected ? 'text-primary-foreground' : 'text-foreground',
													)}
												>
													{secenek.harf}
												</Text>
											</View>
											<View className="flex-1">
												<Text className="text-base text-foreground leading-6">{secenek.metin}</Text>
												{secenek.gorsel ? (
													<MediaImage media={secenek.gorsel} className="mt-2" />
												) : null}
											</View>
										</Pressable>
									);
								})}
							</View>
							<Text className="mt-2 text-muted-foreground text-xs">
								Seçili şıkka tekrar dokunursan soru boş kalır.
							</Text>

							<View className="mt-6 flex-row items-center justify-between gap-2">
								<Pressable
									onPress={() => onGo(current - 1)}
									disabled={current === 0}
									className={cn(
										'flex-row items-center gap-1 rounded-xl border px-4 py-2.5',
										current === 0
											? 'border-border bg-muted'
											: 'border-input bg-card active:bg-muted',
									)}
								>
									<ChevronLeft
										size={16}
										color={current === 0 ? colors.mutedForeground : colors.foreground}
									/>
									<Text
										className={cn(
											'font-semibold text-sm',
											current === 0 ? 'text-muted-foreground' : 'text-foreground',
										)}
									>
										Önceki
									</Text>
								</Pressable>
								{current < total - 1 ? (
									<Pressable
										onPress={() => onGo(current + 1)}
										className="flex-row items-center gap-1 rounded-xl bg-primary px-4 py-2.5 active:bg-primary/90"
									>
										<Text className="font-semibold text-primary-foreground text-sm">Sonraki</Text>
										<ChevronRight size={16} color={colors.primaryForeground} />
									</Pressable>
								) : (
									<Pressable
										onPress={onFinish}
										disabled={submitting}
										className={cn(
											'rounded-xl px-4 py-2.5',
											submitting ? 'bg-muted' : 'bg-primary active:bg-primary/90',
										)}
									>
										<Text
											className={cn(
												'font-semibold text-sm',
												submitting ? 'text-muted-foreground' : 'text-primary-foreground',
											)}
										>
											{submitting ? 'Gönderiliyor...' : 'Sınavı bitir'}
										</Text>
									</Pressable>
								)}
							</View>
						</View>
					</Reveal>

					<View className="rounded-2xl border border-border bg-card p-4 shadow-black/5 shadow-sm">
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
												? 'border-foreground'
												: isAnswered
													? 'border-primary'
													: 'border-input',
											isAnswered ? 'bg-primary' : 'bg-card',
										)}
									>
										<Text
											className={cn(
												'font-medium text-sm',
												isAnswered ? 'text-primary-foreground' : 'text-muted-foreground',
											)}
										>
											{soru.no}
										</Text>
									</Pressable>
								);
							})}
						</View>
						<View className="mt-4 flex-row flex-wrap items-center justify-between gap-3">
							<Text className="text-muted-foreground text-sm">
								{total - answered > 0
									? `${total - answered} soru boş.`
									: 'Bütün sorular cevaplandı.'}
							</Text>
							<Pressable
								onPress={onFinish}
								disabled={submitting}
								className={cn(
									'rounded-xl border border-input px-4 py-2.5',
									submitting ? 'bg-secondary' : 'bg-muted active:bg-accent',
								)}
							>
								<Text
									className={cn(
										'font-semibold text-sm',
										submitting ? 'text-muted-foreground' : 'text-foreground',
									)}
								>
									{submitting ? 'Gönderiliyor...' : 'Sınavı bitir'}
								</Text>
							</Pressable>
						</View>
						{submitError ? (
							<View className="mt-3 rounded-xl bg-destructive/10 p-3">
								<Text className="text-destructive text-sm">{submitError}</Text>
							</View>
						) : null}
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
	const colors = useThemeColors();

	return (
		<ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 16 }}>
			{heading}
			<View className="gap-4 p-4">
				<Reveal delay={70}>
					<View className="rounded-2xl border border-border bg-card p-5 shadow-black/5 shadow-sm">
						<Text className="font-bold text-2xl text-foreground">Sonucun</Text>
						<View className="mt-4 flex-row gap-3">
							<ResultStat label="Net" value={formatNumberTR(result.net)} highlight />
							<ResultStat label="Doğru" value={result.dogru} />
							<ResultStat label="Yanlış" value={result.yanlis} />
							<ResultStat label="Boş" value={result.bos} />
						</View>
					</View>
				</Reveal>

				<Reveal delay={120}>
					<View className="rounded-2xl border border-border bg-accent p-5">
						<Text className="font-bold text-foreground text-xl">
							Geniş analiz raporunu ister misin?
						</Text>
						<Text className="mt-1 text-muted-foreground text-sm">
							Ücretsiz. Sonuçlarını Çağlar Hoca'nın gözünden inceleyip PDF olarak hemen burada
							hazırlıyoruz.
						</Text>
						<View className="mt-3 gap-1.5">
							{ANALIZ_MADDELERI.map((item) => (
								<View key={item} className="flex-row gap-2">
									<View className="mt-0.5 shrink-0">
										<CheckCircle2 size={16} color={colors.primary} />
									</View>
									<Text className="flex-1 text-foreground text-sm">{item}</Text>
								</View>
							))}
						</View>

						{choice === 'ask' ? (
							<View className="mt-5 gap-3">
								<Pressable
									onPress={() => setChoice('yes')}
									className="items-center rounded-xl bg-primary px-6 py-3.5 active:bg-primary/90"
								>
									<Text className="font-bold text-primary-foreground text-sm">
										Evet, raporu istiyorum
									</Text>
								</Pressable>
								<Pressable
									onPress={() => setChoice('no')}
									className="items-center rounded-xl border border-input bg-card px-6 py-3.5 active:bg-muted"
								>
									<Text className="font-bold text-foreground text-sm">Hayır, teşekkürler</Text>
								</Pressable>
							</View>
						) : null}

						{choice === 'no' ? (
							<View className="mt-5 flex-row flex-wrap items-center gap-3">
								<Pressable
									onPress={() => router.push('/courses')}
									className="rounded-xl bg-primary px-4 py-2.5 active:bg-primary/90"
								>
									<Text className="font-bold text-primary-foreground text-sm">Derslere göz at</Text>
								</Pressable>
								<Pressable
									onPress={() => router.push('/deneme-sinavlari')}
									className="active:opacity-70"
								>
									<Text className="text-muted-foreground text-sm underline">
										Başka bir deneme çöz
									</Text>
								</Pressable>
								<Pressable onPress={() => setChoice('yes')} className="active:opacity-70">
									<Text className="text-primary text-sm underline">
										Fikrimi değiştirdim, raporu istiyorum
									</Text>
								</Pressable>
							</View>
						) : null}
					</View>
				</Reveal>

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
	const colors = useThemeColors();
	return (
		<View className="flex-1 items-center rounded-xl bg-muted p-3">
			<Icon size={16} color={colors.primary} />
			<Text className="mt-1 font-bold text-foreground text-lg">{value}</Text>
			<Text className="text-center text-muted-foreground text-xs">{label}</Text>
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
			className={cn('flex-1 items-center rounded-xl p-3', highlight ? 'bg-primary' : 'bg-muted')}
		>
			<Text
				className={cn(
					'font-bold text-xl',
					highlight ? 'text-primary-foreground' : 'text-foreground',
				)}
			>
				{value}
			</Text>
			<Text
				className={cn('text-xs', highlight ? 'text-primary-foreground' : 'text-muted-foreground')}
			>
				{label}
			</Text>
		</View>
	);
}
