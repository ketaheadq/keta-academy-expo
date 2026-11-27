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
import { cn, formatDateTR, formatNumberTR } from '@/lib/utils';
import { useIsAuthenticated, useJWT } from '@/stores/auth-store';

const RATING_LABELS = ['', 'Çok kötü', 'Kötü', 'Orta', 'İyi', 'Mükemmel'];

function StarInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
	return (
		<View className="flex-row items-center gap-3">
			<View className="flex-row gap-1">
				{[1, 2, 3, 4, 5].map((n) => (
					<Pressable key={n} onPress={() => onChange(n)} hitSlop={4}>
						<Star
							size={32}
							color={n <= value ? '#fbbf24' : '#fcd34d'}
							fill={n <= value ? '#fbbf24' : 'transparent'}
						/>
					</Pressable>
				))}
			</View>
			<Text className="text-slate-500 text-sm">{RATING_LABELS[value]}</Text>
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
		<View className="rounded-2xl border border-slate-200 bg-white p-5">
			<View className="mb-5 flex-row flex-wrap items-end justify-between gap-3">
				<View>
					<Text className="font-bold text-slate-900 text-xl">Öğrenci Değerlendirmeleri</Text>
					{summary.count > 0 ? (
						<View className="mt-2 flex-row flex-wrap items-center gap-2">
							<Text className="font-bold text-2xl text-slate-900">
								{formatNumberTR(summary.average)}
							</Text>
							<RatingStars rating={summary.average} size={20} />
							<Text className="text-slate-500 text-sm">({summary.count} değerlendirme)</Text>
						</View>
					) : (
						<Text className="mt-1 text-slate-500 text-sm">Henüz değerlendirme yok.</Text>
					)}
				</View>
				{summary.satisfaction !== null ? (
					<View className="items-center rounded-xl bg-blue-50 px-4 py-2">
						<Text className="font-bold text-blue-600 text-xl">%{summary.satisfaction}</Text>
						<Text className="text-slate-500 text-xs">Memnuniyet</Text>
					</View>
				) : null}
			</View>

			{isAuthenticated && jwt ? (
				myReview.loading ? (
					<ActivityIndicator size="small" color="#2563eb" />
				) : myReview.error ? (
					<View className="mb-6 gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
						<Text className="text-red-700 text-sm">
							Değerlendirmeniz yüklenemedi. Mevcut değerlendirmenizi silmemek için formu kapattık.
						</Text>
						<Pressable onPress={myReview.reload} className="self-start active:opacity-70">
							<Text className="font-semibold text-red-700 text-sm">Tekrar dene</Text>
						</Pressable>
					</View>
				) : (
					<View className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
						<Text className="mb-3 font-semibold text-slate-900 text-sm">
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
							value={comment}
							onChangeText={(text) => {
								setComment(text);
								setStatus('idle');
							}}
							maxLength={1000}
							multiline
							placeholder="Deneyiminizi diğer öğrenci ve velilerle paylaşın (isteğe bağlı)"
							placeholderTextColor="#94a3b8"
							className="mt-3 rounded-lg border border-slate-200 bg-white p-3 text-slate-900 text-sm"
							style={{ minHeight: 80, textAlignVertical: 'top' }}
						/>
						<View className="mt-3 flex-row flex-wrap items-center gap-3">
							<Pressable
								onPress={submit}
								disabled={
									!rating || status === 'saving' || myReview.loading || Boolean(myReview.error)
								}
								className={cn(
									'rounded-xl bg-blue-600 px-6 py-3 active:bg-blue-700',
									(!rating || status === 'saving' || myReview.loading || Boolean(myReview.error)) &&
										'opacity-50',
								)}
							>
								<Text className="font-bold text-sm text-white">
									{status === 'saving' ? 'Kaydediliyor...' : hasReview ? 'Güncelle' : 'Gönder'}
								</Text>
							</Pressable>
							{hasReview ? (
								<Pressable
									onPress={remove}
									disabled={status === 'saving'}
									className="rounded-xl px-4 py-3 active:bg-slate-100"
								>
									<Text className="font-medium text-slate-600 text-sm">Değerlendirmemi sil</Text>
								</Pressable>
							) : null}
						</View>
						{status === 'saved' ? (
							<Text className="mt-3 text-green-700 text-sm">
								Teşekkürler, değerlendirmeniz kaydedildi.
							</Text>
						) : null}
						{status === 'error' ? (
							<Text className="mt-3 text-red-600 text-sm">
								Bir sorun oluştu, lütfen tekrar deneyin.
							</Text>
						) : null}
					</View>
				)
			) : (
				<View className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
					<Text className="text-slate-600 text-sm">
						Değerlendirme yapmak için{' '}
						<Link href={withAppReturn('/giris', returnPath)}>
							<Text className="font-medium text-blue-600 underline">giriş yapın</Text>
						</Link>{' '}
						veya{' '}
						<Link href={withAppReturn('/kayit-ol', returnPath)}>
							<Text className="font-medium text-blue-600 underline">üye olun</Text>
						</Link>
						.
					</Text>
				</View>
			)}

			{publicReviews.loading && !publicReviews.data ? (
				<ActivityIndicator size="small" color="#2563eb" />
			) : null}

			{publicReviews.error ? (
				<View className="gap-2 border-slate-100 border-t py-4">
					<Text className="text-red-600 text-sm">Değerlendirmeler yüklenemedi.</Text>
					<Pressable onPress={publicReviews.reload} className="self-start active:opacity-70">
						<Text className="font-semibold text-blue-600 text-sm">Tekrar dene</Text>
					</Pressable>
				</View>
			) : null}

			{reviews.map((review, index) => (
				<View
					key={`${review.author}-${review.updatedAt}-${index}`}
					className="border-slate-100 border-t py-4"
				>
					<View className="mb-1 flex-row flex-wrap items-center gap-2">
						<RatingStars rating={review.rating} />
						<Text className="font-medium text-slate-900 text-sm">{review.author}</Text>
						<Text className="text-slate-400 text-xs">{formatDateTR(review.updatedAt)}</Text>
					</View>
					{review.comment ? <Text className="text-slate-600 text-sm">{review.comment}</Text> : null}
				</View>
			))}
		</View>
	);
}
