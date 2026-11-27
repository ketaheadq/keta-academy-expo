import { Link } from 'expo-router';
import { Star } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { RatingStars } from '@/components/shared/rating-stars';
import { useAsync } from '@/hooks/use-async';
import { withAppReturn } from '@/lib/routes';
import {
	deleteTutorReview,
	EMPTY_RATING,
	getMyTutorReview,
	getTutorReviews,
	type StrapiTutoringProfile,
	saveTutorReview,
} from '@/lib/strapi';
import { useThemeColors } from '@/lib/theme';
import { cn, formatDateTR, formatNumberTR } from '@/lib/utils';
import { useIsAuthenticated, useJWT } from '@/stores/auth-store';

const RATING_LABELS = ['', 'Çok kötü', 'Kötü', 'Orta', 'İyi', 'Mükemmel'];

function StarInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
	const colors = useThemeColors();

	return (
		<View className="flex-row items-center gap-3">
			<View
				accessibilityRole="radiogroup"
				accessibilityLabel="Değerlendirme puanı"
				className="flex-row gap-1"
			>
				{[1, 2, 3, 4, 5].map((n) => (
					<Pressable
						key={n}
						accessibilityRole="radio"
						accessibilityLabel={`${n} yıldız, ${RATING_LABELS[n]}`}
						accessibilityState={{ checked: n === value }}
						aria-checked={n === value}
						onPress={() => onChange(n)}
						hitSlop={4}
					>
						<Star
							size={32}
							color={n <= value ? colors.warning : colors.input}
							fill={n <= value ? colors.warning : 'transparent'}
						/>
					</Pressable>
				))}
			</View>
			<Text className="text-muted-foreground text-sm">{RATING_LABELS[value]}</Text>
		</View>
	);
}

export function TutorReviews({
	tutor,
	returnPath,
}: {
	tutor: StrapiTutoringProfile;
	returnPath?: string;
}) {
	const jwt = useJWT();
	const isAuthenticated = useIsAuthenticated();
	const colors = useThemeColors();
	const [rating, setRating] = useState(0);
	const [comment, setComment] = useState('');
	const [hasReview, setHasReview] = useState(false);
	const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

	const publicReviews = useAsync(() => getTutorReviews(tutor.documentId), [tutor.documentId]);

	const myReview = useAsync(
		async () => (jwt ? getMyTutorReview(tutor.documentId, jwt) : null),
		[tutor.documentId, jwt],
	);

	useEffect(() => {
		if (myReview.loading || myReview.error) return;
		const mine = myReview.data;
		setHasReview(Boolean(mine));
		if (mine) {
			setRating(mine.rating);
			setComment(mine.comment);
		} else {
			setRating(0);
			setComment('');
		}
	}, [myReview.data, myReview.loading, myReview.error]);

	const summary = publicReviews.data?.meta ?? EMPTY_RATING;
	const reviews = publicReviews.data?.data ?? [];

	const refreshAfterMutation = () => {
		publicReviews.reload();
		myReview.reload();
	};

	const submit = async () => {
		if (!jwt || !rating || status === 'saving' || myReview.loading || myReview.error) return;
		setStatus('saving');
		try {
			await saveTutorReview(tutor.documentId, { rating, comment }, jwt);
			setHasReview(true);
			setStatus('saved');
			refreshAfterMutation();
		} catch {
			setStatus('error');
		}
	};

	const remove = async () => {
		if (!jwt || status === 'saving') return;
		setStatus('saving');
		try {
			await deleteTutorReview(tutor.documentId, jwt);
			setHasReview(false);
			setRating(0);
			setComment('');
			setStatus('idle');
			refreshAfterMutation();
		} catch {
			setStatus('error');
		}
	};

	return (
		<View className="rounded-2xl border border-border bg-card p-5">
			<View className="mb-5 flex-row flex-wrap items-end justify-between gap-3">
				<View>
					<Text className="font-bold text-foreground text-xl">Öğrenci Değerlendirmeleri</Text>
					{summary.count > 0 ? (
						<View className="mt-2 flex-row flex-wrap items-center gap-2">
							<Text className="font-bold text-2xl text-foreground">
								{formatNumberTR(summary.average)}
							</Text>
							<RatingStars rating={summary.average} size={20} />
							<Text className="text-muted-foreground text-sm">({summary.count} değerlendirme)</Text>
						</View>
					) : (
						<Text className="mt-1 text-muted-foreground text-sm">Henüz değerlendirme yok.</Text>
					)}
				</View>
				{summary.satisfaction !== null ? (
					<View className="items-center rounded-xl bg-accent px-4 py-2">
						<Text className="font-bold text-primary text-xl">%{summary.satisfaction}</Text>
						<Text className="text-muted-foreground text-xs">Memnuniyet</Text>
					</View>
				) : null}
			</View>

			{isAuthenticated && jwt ? (
				myReview.loading ? (
					<ActivityIndicator size="small" color={colors.primary} />
				) : myReview.error ? (
					<View className="mb-6 gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4">
						<Text className="text-destructive text-sm">
							Değerlendirmeniz yüklenemedi. Mevcut değerlendirmenizi silmemek için formu kapattık.
						</Text>
						<Pressable onPress={myReview.reload} className="self-start active:opacity-70">
							<Text className="font-semibold text-destructive text-sm">Tekrar dene</Text>
						</Pressable>
					</View>
				) : (
					<View className="mb-6 rounded-xl border border-border bg-muted p-4">
						<Text className="mb-3 font-semibold text-foreground text-sm">
							{hasReview
								? 'Değerlendirmenizi güncelleyin'
								: `${tutor.name} hakkında ne düşünüyorsunuz?`}
						</Text>
						<StarInput
							value={rating}
							onChange={(value) => {
								setRating(value);
								setStatus('idle');
							}}
						/>
						<TextInput
							accessibilityLabel="Değerlendirme yorumu"
							value={comment}
							onChangeText={(text) => {
								setComment(text);
								setStatus('idle');
							}}
							maxLength={1000}
							multiline
							placeholder="Deneyiminizi diğer öğrenci ve velilerle paylaşın (isteğe bağlı)"
							placeholderTextColor={colors.mutedForeground}
							className="mt-3 rounded-lg border border-input bg-card p-3 text-foreground text-sm"
							style={{ minHeight: 80, textAlignVertical: 'top' }}
						/>
						<View className="mt-3 flex-row flex-wrap items-center gap-3">
							<Pressable
								onPress={submit}
								disabled={
									!rating || status === 'saving' || myReview.loading || Boolean(myReview.error)
								}
								className={cn(
									'rounded-xl bg-primary px-6 py-3 active:opacity-80',
									(!rating || status === 'saving' || myReview.loading || Boolean(myReview.error)) &&
										'opacity-50',
								)}
							>
								<Text className="font-bold text-primary-foreground text-sm">
									{status === 'saving' ? 'Kaydediliyor...' : hasReview ? 'Güncelle' : 'Gönder'}
								</Text>
							</Pressable>
							{hasReview ? (
								<Pressable
									onPress={remove}
									disabled={status === 'saving'}
									className="rounded-xl px-4 py-3 active:bg-muted"
								>
									<Text className="font-medium text-muted-foreground text-sm">
										Değerlendirmemi sil
									</Text>
								</Pressable>
							) : null}
						</View>
						{status === 'saved' ? (
							<Text className="mt-3 text-sm text-success">
								Teşekkürler, değerlendirmeniz kaydedildi.
							</Text>
						) : null}
						{status === 'error' ? (
							<Text className="mt-3 text-destructive text-sm">
								Bir sorun oluştu, lütfen tekrar deneyin.
							</Text>
						) : null}
					</View>
				)
			) : (
				<View className="mb-6 rounded-xl border border-border bg-muted p-4">
					<Text className="text-muted-foreground text-sm">
						Değerlendirme yapmak için{' '}
						<Link href={withAppReturn('/giris', returnPath)}>
							<Text className="font-medium text-primary underline">giriş yapın</Text>
						</Link>{' '}
						veya{' '}
						<Link href={withAppReturn('/kayit-ol', returnPath)}>
							<Text className="font-medium text-primary underline">üye olun</Text>
						</Link>
						.
					</Text>
				</View>
			)}

			{publicReviews.loading && !publicReviews.data ? (
				<ActivityIndicator size="small" color={colors.primary} />
			) : null}

			{publicReviews.error ? (
				<View className="gap-2 border-border border-t py-4">
					<Text className="text-destructive text-sm">Değerlendirmeler yüklenemedi.</Text>
					<Pressable onPress={publicReviews.reload} className="self-start active:opacity-70">
						<Text className="font-semibold text-primary text-sm">Tekrar dene</Text>
					</Pressable>
				</View>
			) : null}

			{reviews.map((review, index) => (
				<View
					key={`${review.author}-${review.updatedAt}-${index}`}
					className="border-border border-t py-4"
				>
					<View className="mb-1 flex-row flex-wrap items-center gap-2">
						<RatingStars rating={review.rating} />
						<Text className="font-medium text-foreground text-sm">{review.author}</Text>
						<Text className="text-muted-foreground text-xs">{formatDateTR(review.updatedAt)}</Text>
					</View>
					{review.comment ? (
						<Text className="text-muted-foreground text-sm">{review.comment}</Text>
					) : null}
				</View>
			))}
		</View>
	);
}
