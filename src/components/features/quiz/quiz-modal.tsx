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
import { RichText } from '@/components/shared/rich-text';
import {
	type QuizResult,
	type StrapiAnswerOption,
	type StrapiQuestion,
	type StrapiQuiz,
	submitQuiz,
} from '@/lib/strapi';
import { cn, formatClock, generateUuid } from '@/lib/utils';

interface QuizModalProps {
	visible: boolean;
	quiz: StrapiQuiz;
	jwt: string;
	onClose: () => void;
}

export default function QuizModal({ visible, quiz, jwt, onClose }: QuizModalProps) {
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

	return (
		<Modal visible={visible} animationType="slide" onRequestClose={onClose}>
			<View className="flex-1 bg-white">
				<View className="gap-3 border-slate-100 border-b px-5 pt-3 pb-4">
					<View className="flex-row items-start gap-3">
						<View className="flex-1 gap-1">
							<View className="flex-row items-center gap-2">
								<Target size={20} color="#0f172a" />
								<Text className="flex-1 font-bold text-lg text-slate-900">{quiz.title}</Text>
							</View>
							{quiz.description ? (
								<Text className="text-slate-500 text-sm">{quiz.description}</Text>
							) : null}
						</View>
						<Pressable
							onPress={onClose}
							disabled={isSubmitting}
							accessibilityRole="button"
							accessibilityLabel="Quizi kapat"
							className="rounded-full bg-slate-100 p-2 active:bg-slate-200"
						>
							<X size={18} color="#475569" />
						</Pressable>
					</View>
					{result ? null : (
						<>
							<View className="flex-row items-center justify-between">
								{timeSeconds ? (
									<View className="flex-row items-center gap-1.5">
										<Clock size={14} color="#64748b" />
										<Text className="text-slate-500 text-sm">
											{formatClock(remainingSeconds ?? timeSeconds)}
										</Text>
									</View>
								) : (
									<View />
								)}
								<View className="rounded-full border border-slate-200 px-2.5 py-1">
									<Text className="font-semibold text-slate-600 text-xs">
										{currentIndex + 1} / {totalQuestions}
									</Text>
								</View>
							</View>
							<View className="h-2 overflow-hidden rounded-full bg-slate-100">
								<View
									className="h-full rounded-full bg-blue-600"
									style={{ width: `${progress}%` }}
								/>
							</View>
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
						<View className="flex-row gap-3">
							<View className="h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
								<Text className="font-bold text-sm text-white">{currentIndex + 1}</Text>
							</View>
							<View className="flex-1">
								<RichText blocks={question.text} />
							</View>
						</View>

						<View className="gap-3">
							{options.map((option) => (
								<OptionRow
									key={option.id}
									option={option}
									selected={answers[question.id] === option.id}
									disabled={isSubmitting || remainingSeconds === 0}
									onSelect={() => setAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
								/>
							))}
						</View>

						<View className="flex-row items-center gap-2">
							<Text className="text-slate-500 text-sm">Puan: 1</Text>
							{answers[question.id] !== undefined ? (
								<View className="flex-row items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1">
									<CheckCircle size={12} color="#16a34a" />
									<Text className="font-semibold text-slate-600 text-xs">Cevaplanmış</Text>
								</View>
							) : null}
						</View>

						{submitError ? (
							<View className="gap-2">
								<Text className="text-red-600 text-sm">{submitError}</Text>
								{remainingSeconds !== 0 || allAnswered ? (
									<Pressable
										onPress={() => void handleSubmit(true)}
										disabled={isSubmitting}
										className="self-start rounded-full border border-slate-300 px-4 py-2 active:bg-slate-50"
									>
										<Text className="font-semibold text-slate-700 text-sm">
											Gönderimi tekrar dene
										</Text>
									</Pressable>
								) : null}
							</View>
						) : null}

						<View className="items-center gap-3">
							{!allAnswered && remainingSeconds !== 0 ? (
								<View className="flex-row items-center gap-1.5">
									<AlertCircle size={14} color="#d97706" />
									<Text className="text-amber-600 text-sm">
										Göndermek için tüm soruları cevaplayın
									</Text>
								</View>
							) : null}
							<View className="flex-row items-center justify-between gap-3 self-stretch">
								<Pressable
									disabled={currentIndex === 0 || isSubmitting || remainingSeconds === 0}
									onPress={() => setCurrentIndex((i) => i - 1)}
									className={cn(
										'flex-row items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 active:bg-slate-50',
										currentIndex === 0 && 'opacity-40',
									)}
								>
									<ArrowLeft size={16} color="#475569" />
									<Text className="font-semibold text-slate-700 text-sm">Önceki</Text>
								</Pressable>
								{currentIndex === totalQuestions - 1 ? (
									<Pressable
										disabled={!allAnswered || isSubmitting}
										onPress={() => void handleSubmit()}
										className={cn(
											'flex-row items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 active:bg-blue-700',
											(!allAnswered || isSubmitting) && 'opacity-40',
										)}
									>
										<Trophy size={16} color="#ffffff" />
										<Text className="font-semibold text-sm text-white">
											{isSubmitting ? 'Gönderiliyor...' : 'Quizi Gönder'}
										</Text>
									</Pressable>
								) : (
									<Pressable
										onPress={() => setCurrentIndex((i) => i + 1)}
										disabled={isSubmitting || remainingSeconds === 0}
										className="flex-row items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 active:bg-blue-700 disabled:opacity-40"
									>
										<Text className="font-semibold text-sm text-white">Sonraki</Text>
										<ArrowRight size={16} color="#ffffff" />
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
	return (
		<Pressable
			onPress={onSelect}
			disabled={disabled}
			className={cn(
				'flex-row items-center gap-3 rounded-xl border p-4',
				selected ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-white active:bg-slate-50',
				disabled && 'opacity-60',
			)}
		>
			<View
				className={cn(
					'size-5 items-center justify-center rounded-full border-2',
					selected ? 'border-blue-600' : 'border-slate-300',
				)}
			>
				{selected ? <View className="size-2.5 rounded-full bg-blue-600" /> : null}
			</View>
			<Text
				className={cn(
					'flex-1 text-base',
					selected ? 'font-semibold text-blue-900' : 'text-slate-700',
				)}
			>
				{option.text}
			</Text>
		</Pressable>
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
	return (
		<ScrollView
			className="flex-1"
			contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 20 }}
		>
			<View className="items-center gap-2">
				<View className={cn('rounded-full p-3', result.passed ? 'bg-blue-50' : 'bg-red-50')}>
					{result.passed ? (
						<Trophy size={32} color="#2563eb" />
					) : (
						<XCircle size={32} color="#dc2626" />
					)}
				</View>
				<Text className="text-center font-bold text-2xl text-slate-900">
					{result.passed ? 'Tebrikler!' : 'Tekrar Deneyin!'}
				</Text>
				<Text className="text-center text-slate-500">
					{result.passed
						? 'Quizi başarıyla tamamladınız!'
						: `Geçmek için gerekli puana ulaşamadınız. Puanınız %${result.percentage.toFixed(1)}`}
				</Text>
			</View>

			<View className="flex-row flex-wrap gap-3">
				<StatTile value={`${result.percentage.toFixed(1)}%`} label="Final Puan" tone="blue" />
				<StatTile value={String(result.correctAnswers)} label="Doğru" tone="blue" />
				<StatTile
					value={String(result.totalQuestions - result.correctAnswers)}
					label="Yanlış"
					tone="red"
				/>
				<StatTile value={`${result.earnedPoints}/${result.totalPoints}`} label="Puan" tone="blue" />
			</View>

			<View className="gap-3">
				<Text className="font-bold text-lg text-slate-900">Soru İncelemesi</Text>
				{result.attempts.map((attempt) => (
					<AttemptRow key={attempt.questionId} attempt={attempt} questions={questions} />
				))}
			</View>

			<View className="flex-row justify-center gap-3">
				<Pressable
					onPress={onRetake}
					className="flex-row items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 active:bg-blue-700"
				>
					<RotateCcw size={16} color="#ffffff" />
					<Text className="font-semibold text-sm text-white">Tekrar Dene</Text>
				</Pressable>
				<Pressable
					onPress={onClose}
					className="rounded-xl border border-slate-200 px-5 py-3 active:bg-slate-50"
				>
					<Text className="font-semibold text-slate-700 text-sm">Quizi Kapat</Text>
				</Pressable>
			</View>
		</ScrollView>
	);
}

function StatTile({ value, label, tone }: { value: string; label: string; tone: 'blue' | 'red' }) {
	return (
		<View
			className={cn('items-center rounded-xl p-4', tone === 'blue' ? 'bg-blue-50' : 'bg-red-50')}
			style={{ flexGrow: 1, flexBasis: '44%' }}
		>
			<Text
				className={cn('font-bold text-2xl', tone === 'blue' ? 'text-blue-600' : 'text-red-600')}
			>
				{value}
			</Text>
			<Text className="text-slate-500 text-sm">{label}</Text>
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
	const index = questions.findIndex((q) => q.id === attempt.questionId);
	const question = index >= 0 ? questions[index] : undefined;
	return (
		<View
			className={cn(
				'rounded-xl border border-slate-100 border-l-4 bg-white p-4',
				attempt.isCorrect ? 'border-l-green-500' : 'border-l-red-500',
			)}
		>
			<View className="flex-row gap-3">
				<View className="mt-0.5">
					{attempt.isCorrect ? (
						<CheckCircle size={20} color="#2563eb" />
					) : (
						<XCircle size={20} color="#dc2626" />
					)}
				</View>
				<View className="flex-1 gap-1">
					{question ? (
						<View>
							<Text className="font-medium text-slate-900">{index + 1}. soru</Text>
							<RichText blocks={question.text} />
						</View>
					) : null}
					<Text className="text-slate-500 text-sm">
						Cevabınız:{' '}
						<Text
							className={
								attempt.isCorrect ? 'font-semibold text-blue-600' : 'font-semibold text-red-600'
							}
						>
							{attempt.selectedAnswer}
						</Text>
					</Text>
					{!attempt.isCorrect ? (
						<Text className="text-slate-500 text-sm">
							Doğru cevap:{' '}
							<Text className="font-semibold text-blue-600">{attempt.correctAnswer}</Text>
						</Text>
					) : null}
					{attempt.explanation?.length ? (
						<View className="mt-2 rounded-lg bg-blue-50 p-3">
							<Text className="font-bold text-blue-700 text-sm">Açıklama:</Text>
							<RichText blocks={attempt.explanation} />
						</View>
					) : null}
				</View>
			</View>
		</View>
	);
}
