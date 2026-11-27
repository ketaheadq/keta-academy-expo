import {
	AlertCircle,
	ArrowLeft,
	ArrowRight,
	CheckCircle,
	Clock,
	RotateCcw,
	Target,
	Trophy,
	X,
	XCircle,
} from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Animated, {
	useAnimatedStyle,
	useReducedMotion,
	useSharedValue,
	withSequence,
	withSpring,
	withTiming,
} from 'react-native-reanimated';
import { AnimatedProgress, Celebration, Reveal } from '@/components/shared/motion';
import { RichText } from '@/components/shared/rich-text';
import {
	type QuizResult,
	type StrapiAnswerOption,
	type StrapiQuestion,
	type StrapiQuiz,
	submitQuiz,
} from '@/lib/strapi';
import { useThemeColors } from '@/lib/theme';
import { cn, formatClock, generateUuid } from '@/lib/utils';

interface QuizModalProps {
	visible: boolean;
	quiz: StrapiQuiz;
	jwt: string;
	onClose: () => void;
}

export default function QuizModal({ visible, quiz, jwt, onClose }: QuizModalProps) {
	const colors = useThemeColors();
	const reduceMotion = useReducedMotion();
	const [currentIndex, setCurrentIndex] = useState(0);
	const [answers, setAnswers] = useState<Record<number, number>>({});
	const [result, setResult] = useState<QuizResult | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
	// One id per attempt, reused when retrying a failed submission so the backend can dedupe.
	const submissionIdRef = useRef<string | null>(null);
	const expirySubmitAttemptedRef = useRef(false);

	const reset = useCallback(() => {
		setCurrentIndex(0);
		setAnswers({});
		setResult(null);
		setIsSubmitting(false);
		setSubmitError(null);
		setRemainingSeconds(quiz.timeLimit ? quiz.timeLimit * 60 : null);
		submissionIdRef.current = null;
		expirySubmitAttemptedRef.current = false;
	}, [quiz.timeLimit]);

	useEffect(() => {
		if (visible) reset();
	}, [visible, reset]);

	const questions = quiz.questions;
	const totalQuestions = questions.length;
	const question = questions[currentIndex];
	const progress = totalQuestions ? ((currentIndex + 1) / totalQuestions) * 100 : 0;
	const allAnswered = questions.every((q) => answers[q.id] !== undefined);
	const timeSeconds = quiz.timeLimit ? quiz.timeLimit * 60 : null;

	const options = useMemo(
		() => [...(question?.options ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
		[question],
	);

	useEffect(() => {
		if (!visible || result || timeSeconds === null) return;
		const timer = setInterval(() => {
			setRemainingSeconds((seconds) => (seconds === null ? null : Math.max(0, seconds - 1)));
		}, 1000);
		return () => clearInterval(timer);
	}, [visible, result, timeSeconds]);

	const handleSubmit = useCallback(
		async (automatic = false) => {
			if (isSubmitting || result || (!automatic && !allAnswered)) return;
			setIsSubmitting(true);
			setSubmitError(null);
			submissionIdRef.current ??= generateUuid();
			try {
				const quizResult = await submitQuiz(quiz.documentId, answers, submissionIdRef.current, jwt);
				setResult(quizResult);
			} catch {
				setSubmitError(
					automatic && remainingSeconds === 0 && !allAnswered
						? "Süre dolduğu için yarım kalan quiz kaydedilemedi. Quiz'i kapatıp yeniden deneyebilirsiniz."
						: 'Quiz kaydedilemedi. Lütfen tekrar deneyin.',
				);
			} finally {
				setIsSubmitting(false);
			}
		},
		[allAnswered, answers, isSubmitting, jwt, quiz.documentId, remainingSeconds, result],
	);

	useEffect(() => {
		if (
			visible &&
			remainingSeconds === 0 &&
			!result &&
			!isSubmitting &&
			!expirySubmitAttemptedRef.current
		) {
			expirySubmitAttemptedRef.current = true;
			void handleSubmit(true);
		}
	}, [visible, remainingSeconds, result, isSubmitting, handleSubmit]);

	const timeExpiring = remainingSeconds !== null && remainingSeconds <= 10;

	return (
		<Modal
			visible={visible}
			animationType={reduceMotion ? 'none' : 'slide'}
			onRequestClose={onClose}
		>
			<View className="flex-1 bg-background">
				<View className="gap-3 border-border border-b bg-card px-5 pt-3 pb-4">
					<View className="flex-row items-start gap-3">
						<View className="flex-1 gap-1">
							<View className="flex-row items-center gap-2">
								<Target size={20} color={colors.primary} />
								<Text className="flex-1 font-bold text-foreground text-lg">{quiz.title}</Text>
							</View>
							{quiz.description ? (
								<Text className="text-muted-foreground text-sm">{quiz.description}</Text>
							) : null}
						</View>
						<Pressable
							onPress={onClose}
							disabled={isSubmitting}
							accessibilityRole="button"
							accessibilityLabel="Quizi kapat"
							className="rounded-full bg-muted p-2 active:bg-secondary"
						>
							<X size={18} color={colors.mutedForeground} />
						</Pressable>
					</View>
					{result ? null : (
						<>
							<View className="flex-row items-center justify-between">
								{timeSeconds ? (
									<View className="flex-row items-center gap-1.5">
										<Clock
											size={14}
											color={timeExpiring ? colors.destructive : colors.mutedForeground}
										/>
										<Text
											className={cn(
												'text-sm',
												timeExpiring ? 'text-destructive' : 'text-muted-foreground',
											)}
										>
											{formatClock(remainingSeconds ?? timeSeconds)}
										</Text>
									</View>
								) : (
									<View />
								)}
								<View className="rounded-full border border-input px-2.5 py-1">
									<Text className="font-semibold text-muted-foreground text-xs">
										{currentIndex + 1} / {totalQuestions}
									</Text>
								</View>
							</View>
							<AnimatedProgress
								progress={progress}
								className="h-2"
								accessibilityLabel="Quiz ilerlemesi"
							/>
						</>
					)}
				</View>

				{result ? (
					<ResultScreen questions={questions} result={result} onRetake={reset} onClose={onClose} />
				) : question ? (
					<ScrollView
						className="flex-1"
						contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }}
						pointerEvents={isSubmitting ? 'none' : 'auto'}
					>
						<Reveal key={question.id}>
							<View className="gap-4">
								<View className="flex-row gap-3">
									<View className="h-7 w-7 items-center justify-center rounded-lg bg-primary">
										<Text className="font-bold text-primary-foreground text-sm">
											{currentIndex + 1}
										</Text>
									</View>
									<View className="flex-1">
										<RichText blocks={question.text} />
									</View>
								</View>

								<View className="gap-3">
									{options.map((option, index) => (
										<Reveal key={option.id} delay={index * 45} distance={8}>
											<OptionRow
												option={option}
												selected={answers[question.id] === option.id}
												disabled={isSubmitting || remainingSeconds === 0}
												onSelect={() =>
													setAnswers((prev) => ({ ...prev, [question.id]: option.id }))
												}
											/>
										</Reveal>
									))}
								</View>
							</View>
						</Reveal>

						<View className="flex-row items-center gap-2">
							<Text className="text-muted-foreground text-sm">Puan: 1</Text>
							{answers[question.id] !== undefined ? (
								<View className="flex-row items-center gap-1 rounded-full bg-success/10 px-2.5 py-1">
									<CheckCircle size={12} color={colors.success} />
									<Text className="font-semibold text-success text-xs">Cevaplanmış</Text>
								</View>
							) : null}
						</View>

						{submitError ? (
							<View className="gap-2">
								<Text className="text-destructive text-sm">{submitError}</Text>
								{remainingSeconds !== 0 || allAnswered ? (
									<Pressable
										onPress={() => void handleSubmit(true)}
										disabled={isSubmitting}
										className="self-start rounded-full border border-input bg-card px-4 py-2 active:bg-muted"
									>
										<Text className="font-semibold text-foreground text-sm">
											Gönderimi tekrar dene
										</Text>
									</Pressable>
								) : null}
							</View>
						) : null}

						<View className="items-center gap-3">
							{!allAnswered && remainingSeconds !== 0 ? (
								<View className="flex-row items-center gap-1.5">
									<AlertCircle size={14} color={colors.warning} />
									<Text className="text-sm text-warning">
										Göndermek için tüm soruları cevaplayın
									</Text>
								</View>
							) : null}
							<View className="flex-row items-center justify-between gap-3 self-stretch">
								<Pressable
									disabled={currentIndex === 0 || isSubmitting || remainingSeconds === 0}
									onPress={() => setCurrentIndex((i) => i - 1)}
									accessibilityRole="button"
									accessibilityLabel="Önceki soru"
									className={cn(
										'flex-row items-center gap-2 rounded-xl border border-input bg-card px-5 py-3 active:bg-muted',
										currentIndex === 0 && 'opacity-40',
									)}
								>
									<ArrowLeft size={16} color={colors.mutedForeground} />
									<Text className="font-semibold text-foreground text-sm">Önceki</Text>
								</Pressable>
								{currentIndex === totalQuestions - 1 ? (
									<Pressable
										disabled={!allAnswered || isSubmitting}
										onPress={() => void handleSubmit()}
										accessibilityRole="button"
										className={cn(
											'flex-row items-center gap-2 rounded-xl bg-primary px-5 py-3 active:bg-primary/90',
											(!allAnswered || isSubmitting) && 'opacity-40',
										)}
									>
										<Trophy size={16} color={colors.primaryForeground} />
										<Text className="font-semibold text-primary-foreground text-sm">
											{isSubmitting ? 'Gönderiliyor...' : 'Quizi Gönder'}
										</Text>
									</Pressable>
								) : (
									<Pressable
										onPress={() => setCurrentIndex((i) => i + 1)}
										disabled={isSubmitting || remainingSeconds === 0}
										accessibilityRole="button"
										accessibilityLabel="Sonraki soru"
										className="flex-row items-center gap-2 rounded-xl bg-primary px-5 py-3 active:bg-primary/90 disabled:opacity-40"
									>
										<Text className="font-semibold text-primary-foreground text-sm">Sonraki</Text>
										<ArrowRight size={16} color={colors.primaryForeground} />
									</Pressable>
								)}
							</View>
						</View>
					</ScrollView>
				) : null}
			</View>
		</Modal>
	);
}

function OptionRow({
	option,
	selected,
	disabled,
	onSelect,
}: {
	option: StrapiAnswerOption;
	selected: boolean;
	disabled: boolean;
	onSelect: () => void;
}) {
	const reduceMotion = useReducedMotion();
	const scale = useSharedValue(1);

	useEffect(() => {
		if (!selected || disabled || reduceMotion) {
			scale.value = 1;
			return;
		}
		scale.value = withSequence(
			withTiming(0.97, { duration: 90 }),
			withSpring(1, { damping: 14, stiffness: 240 }),
		);
	}, [disabled, reduceMotion, scale, selected]);

	const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

	return (
		<Animated.View style={animatedStyle}>
			<Pressable
				onPress={onSelect}
				disabled={disabled}
				accessibilityRole="radio"
				accessibilityState={{ checked: selected, disabled }}
				className={cn(
					'flex-row items-center gap-3 rounded-xl border p-4',
					selected ? 'border-primary bg-accent' : 'border-input bg-card active:bg-muted',
					disabled && 'opacity-60',
				)}
			>
				<View
					className={cn(
						'size-5 items-center justify-center rounded-full border-2',
						selected ? 'border-primary' : 'border-input',
					)}
				>
					{selected ? <View className="size-2.5 rounded-full bg-primary" /> : null}
				</View>
				<Text
					className={cn(
						'flex-1 text-base',
						selected ? 'font-semibold text-foreground' : 'text-foreground',
					)}
				>
					{option.text}
				</Text>
			</Pressable>
		</Animated.View>
	);
}

function ResultScreen({
	questions,
	result,
	onRetake,
	onClose,
}: {
	questions: StrapiQuestion[];
	result: QuizResult;
	onRetake: () => void;
	onClose: () => void;
}) {
	const colors = useThemeColors();

	return (
		<ScrollView
			className="flex-1"
			contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
		>
			<Reveal>
				<View className="items-center gap-2">
					{result.passed ? <Celebration /> : null}
					<View
						className={cn(
							'rounded-full p-3',
							result.passed ? 'bg-success/10' : 'bg-destructive/10',
						)}
					>
						{result.passed ? (
							<Trophy size={32} color={colors.success} />
						) : (
							<XCircle size={32} color={colors.destructive} />
						)}
					</View>
					<Text className="text-center font-bold text-2xl text-foreground">
						{result.passed ? 'Tebrikler!' : 'Tekrar Deneyin!'}
					</Text>
					<Text className="text-center text-muted-foreground">
						{result.passed
							? 'Quizi başarıyla tamamladınız!'
							: `Geçmek için gerekli puana ulaşamadınız. Puanınız %${result.percentage.toFixed(1)}`}
					</Text>
				</View>
			</Reveal>

			<View className="flex-row flex-wrap gap-3">
				<StatTile
					value={`${result.percentage.toFixed(1)}%`}
					label="Final Puan"
					tone="primary"
					delay={70}
				/>
				<StatTile value={String(result.correctAnswers)} label="Doğru" tone="success" delay={120} />
				<StatTile
					value={String(result.totalQuestions - result.correctAnswers)}
					label="Yanlış"
					tone="destructive"
					delay={170}
				/>
				<StatTile
					value={`${result.earnedPoints}/${result.totalPoints}`}
					label="Puan"
					tone="primary"
					delay={220}
				/>
			</View>

			<Reveal delay={220}>
				<View className="gap-3">
					<Text className="font-bold text-foreground text-lg">Soru İncelemesi</Text>
					{result.attempts.map((attempt, index) => (
						<Reveal key={attempt.questionId} delay={Math.min(index * 45, 270)} distance={10}>
							<AttemptRow attempt={attempt} questions={questions} />
						</Reveal>
					))}
				</View>
			</Reveal>

			<Reveal delay={300}>
				<View className="flex-row justify-center gap-3">
					<Pressable
						onPress={onRetake}
						accessibilityRole="button"
						className="flex-row items-center gap-2 rounded-xl bg-primary px-5 py-3 active:bg-primary/90"
					>
						<RotateCcw size={16} color={colors.primaryForeground} />
						<Text className="font-semibold text-primary-foreground text-sm">Tekrar Dene</Text>
					</Pressable>
					<Pressable
						onPress={onClose}
						accessibilityRole="button"
						className="rounded-xl border border-input bg-card px-5 py-3 active:bg-muted"
					>
						<Text className="font-semibold text-foreground text-sm">Quizi Kapat</Text>
					</Pressable>
				</View>
			</Reveal>
		</ScrollView>
	);
}

function StatTile({
	value,
	label,
	tone,
	delay,
}: {
	value: string;
	label: string;
	tone: 'primary' | 'success' | 'destructive';
	delay: number;
}) {
	return (
		<View style={{ flexGrow: 1, flexBasis: '44%' }}>
			<Reveal delay={delay} distance={10}>
				<View
					className={cn(
						'items-center rounded-xl p-4',
						tone === 'success'
							? 'bg-success/10'
							: tone === 'destructive'
								? 'bg-destructive/10'
								: 'bg-accent',
					)}
				>
					<Text
						className={cn(
							'font-bold text-2xl',
							tone === 'success'
								? 'text-success'
								: tone === 'destructive'
									? 'text-destructive'
									: 'text-primary',
						)}
					>
						{value}
					</Text>
					<Text className="text-muted-foreground text-sm">{label}</Text>
				</View>
			</Reveal>
		</View>
	);
}

function AttemptRow({
	attempt,
	questions,
}: {
	attempt: QuizResult['attempts'][number];
	questions: StrapiQuestion[];
}) {
	const colors = useThemeColors();
	const index = questions.findIndex((q) => q.id === attempt.questionId);
	const question = index >= 0 ? questions[index] : undefined;
	return (
		<View
			className={cn(
				'rounded-xl border border-border border-l-4 bg-card p-4',
				attempt.isCorrect ? 'border-l-success' : 'border-l-destructive',
			)}
		>
			<View className="flex-row gap-3">
				<View className="mt-0.5">
					{attempt.isCorrect ? (
						<CheckCircle size={20} color={colors.success} />
					) : (
						<XCircle size={20} color={colors.destructive} />
					)}
				</View>
				<View className="flex-1 gap-1">
					{question ? (
						<View>
							<Text className="font-medium text-foreground">{index + 1}. soru</Text>
							<RichText blocks={question.text} />
						</View>
					) : null}
					<Text className="text-muted-foreground text-sm">
						Cevabınız:{' '}
						<Text
							className={cn(
								'font-semibold',
								attempt.isCorrect ? 'text-success' : 'text-destructive',
							)}
						>
							{attempt.selectedAnswer}
						</Text>
					</Text>
					{!attempt.isCorrect ? (
						<Text className="text-muted-foreground text-sm">
							Doğru cevap:{' '}
							<Text className="font-semibold text-primary">{attempt.correctAnswer}</Text>
						</Text>
					) : null}
					{attempt.explanation?.length ? (
						<View className="mt-2 rounded-lg bg-muted p-3">
							<Text className="font-bold text-primary text-sm">Açıklama:</Text>
							<RichText blocks={attempt.explanation} />
						</View>
					) : null}
				</View>
			</View>
		</View>
	);
}
