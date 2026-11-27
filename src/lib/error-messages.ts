/** Error messages for user-facing notifications. */
const errorMessages = {
	invalid_credentials: 'Geçersiz kullanıcı adı veya şifre.',
	unauthorized: 'Bu işlem için yetkiniz bulunmamaktadır.',
	network_error: 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.',
	server_error: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
	validation_error: 'Girdiğiniz bilgilerde hata var. Lütfen kontrol edin.',
	session_expired: 'Oturumunuzun süresi dolmuş. Lütfen tekrar giriş yapın.',
	access_denied: 'Erişim reddedildi.',
	not_found: 'Aradığınız sayfa bulunamadı.',
	timeout: 'İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.',
	file_too_large: 'Dosya boyutu çok büyük.',
	invalid_file_type: 'Geçersiz dosya türü.',
	quota_exceeded: 'Kotanız aşıldı.',
	maintenance: 'Sistem bakımda. Lütfen daha sonra tekrar deneyin.',
} as const;

export type ErrorMessageKey = keyof typeof errorMessages;

export function errorMessage(key?: string | null): string {
	if (!key) return '';
	return errorMessages[key as ErrorMessageKey] ?? 'Bilinmeyen bir hata oluştu.';
}

/** RN and the web browsers report an unreachable host with different wording. */
const NETWORK_FAILURE = /network request failed|failed to fetch|load failed/i;

/**
 * Turns a caught value into text a Turkish user can act on. Library messages are already
 * Turkish; transport failures only ever arrive as English runtime errors, so they are mapped.
 */
export function describeError(cause: unknown): string {
	if (!(cause instanceof Error)) return errorMessages.server_error;
	if (NETWORK_FAILURE.test(cause.message)) return errorMessages.network_error;
	return cause.message || errorMessages.server_error;
}

export default errorMessages;
