export interface StrapiRichTextBlock {
	type: string;
	children: StrapiRichTextNode[];
}

export interface StrapiRichTextNode {
	type: string;
	text?: string;
	bold?: boolean;
	italic?: boolean;
	underline?: boolean;
	strikethrough?: boolean;
	code?: boolean;
	children?: StrapiRichTextNode[];
	url?: string;
	level?: number;
}

/** Generic Strapi rich-text block as returned by the REST API. */
export interface StrapiBlock {
	type: string;
	children: { text: string; type?: string; [key: string]: any }[];
	[key: string]: any;
}

export interface StrapiImage {
	id: number;
	documentId: string;
	name: string;
	alternativeText: string | null;
	caption: string | null;
	width: number;
	height: number;
	formats: Record<string, unknown> | null;
	hash: string;
	ext: string;
	mime: string;
	size: number;
	url: string;
	previewUrl: string | null;
	provider: string;
	provider_metadata?: {
		public_id: string;
		resource_type: string;
	} | null;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
}

export interface StrapiSettings {
	id: number;
	documentId: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	siteName: string;
	defaultSEODescription: string | null;
	analyticsID: string | null;
	logo: StrapiImage;
	favicon: StrapiImage;
}

export interface StrapiSEO {
	id: number;
	metaTitle: string;
	metaDescription: string;
	keywords?: string;
	metaRobots?: string;
	metaImage?: StrapiImage;
}

export interface StrapiPageSEO {
	id: number;
	metaTitle: string;
	metaDescription: string;
	keywords?: string;
	canonicalURL?: string;
	preventIndexing?: boolean;
	metaImage?: StrapiImage;
	structuredData?: Record<string, unknown> | null;
}

export interface StrapiPage {
	id: number;
	documentId: string;
	title: string;
	slug: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	pageType:
		| 'Üniversite Taban Puanları'
		| 'Bölüm Taban Puanları'
		| 'Videolar'
		| 'Bloglar'
		| 'Hesaplama Araçları';
	page_category?: StrapiPageCategory;
	admission_scores?: StrapiAdmissionScore[];
	videos?: StrapiVideo[];
	blogs?: StrapiBlog[];
	SEO?: StrapiPageSEO;
}

export interface StrapiPageCategory {
	id: number;
	documentId: string;
	slug: string;
	title: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	pages: StrapiPage[];
}

export interface StrapiVideo {
	id: number;
	documentId: string;
	title: string;
	slug: string;
	href: string;
	related_datas?: StrapiVideo[];
	page?: StrapiPage;
	isPopular: boolean;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	SEO?: StrapiSEO;
}

export interface StrapiBlog {
	id: number;
	documentId: string;
	title: string;
	slug: string;
	content: StrapiBlock[];
	image?: StrapiImage;
	category?: string;
	related_datas?: StrapiBlog[];
	page?: StrapiPage;
	isPopular: boolean;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	SEO?: StrapiSEO;
}

export interface StrapiUniversity {
	id: number;
	documentId: string;
	title: string;
	description?: string;
	content?: StrapiBlock[];
	slug: string;
	ranking?: number;
	seoTitle?: string;
	seoDescription?: string;
	admission_score?: StrapiAdmissionScore;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
}

export interface StrapiDepartment {
	id: number;
	documentId: string;
	/** The API really spells this "titile". */
	titile: string;
	content?: StrapiBlock[];
	admission_score?: StrapiAdmissionScore;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
}

export interface StrapiAdmissionScore {
	id: number;
	documentId: string;
	title: string;
	slug: string;
	content: StrapiBlock[];
	tableData: string;
	related_datas?: StrapiAdmissionScore[];
	page?: StrapiPage;
	isPopular: boolean;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	university: StrapiUniversity;
	department: StrapiDepartment;
	SEO?: StrapiSEO;
}

export interface StrapiSubject {
	id: number;
	documentId: string;
	title: string;
	slug: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	description: string;
	icon?: { id: number; name: string };
	SEO?: StrapiSEO | null;
}

export interface StrapiGrade {
	id: number;
	documentId: string;
	title: string;
	slug: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	order: number;
}

export interface StrapiAnswerOption {
	id: number;
	documentId: string;
	text: string;
	order?: number;
}

export type QuestionType = 'multipleChoice' | 'trueFalse';

export interface StrapiQuestion {
	id: number;
	documentId: string;
	text: StrapiBlock[];
	type: QuestionType;
	order?: number;
	options: StrapiAnswerOption[];
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
}

export interface StrapiQuizProgress {
	id: number;
	documentId: string;
	score?: number;
	completed: boolean;
	startedAt?: string;
	completedAt?: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
}

export interface StrapiQuiz {
	id: number;
	documentId: string;
	title: string;
	description?: string;
	/** Minutes. */
	timeLimit?: number;
	/** 0-100. */
	passingScore?: number;
	maxAttempts?: number;
	shuffleQuestions?: boolean;
	showCorrectAnswers?: boolean;
	questions: StrapiQuestion[];
	lessons?: StrapiLesson[];
	quiz_progresses?: StrapiQuizProgress[];
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	slug: string;
	thumbnail?: StrapiImage;
	subject?: StrapiSubject;
	grades?: StrapiGrade[];
}

export interface StrapiLesson {
	id: number;
	documentId: string;
	title: string;
	description: string;
	videoURL?: string | null;
	content?: StrapiBlock[];
	attachments?: { id: number; url: string; name: string }[];
	quiz?: StrapiQuiz | null;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	slug: string;
	SEO?: StrapiSEO | null;
}

export interface StrapiCourse {
	id: number;
	documentId: string;
	title: string;
	description: string;
	duration: number;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	slug: string;
	thumbnail: StrapiImage;
	image?: StrapiImage | null;
	subject: StrapiSubject;
	icon?: { id: number; name: string };
	grades: StrapiGrade[];
	isPopular: boolean | null;
	course_lessons: StrapiCourseLesson[];
	SEO?: StrapiSEO | null;
}

export interface StrapiCourseLesson {
	id: number;
	documentId: string;
	order: number;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	lesson: StrapiLesson;
	course: StrapiCourse | number;
}

export interface StrapiPrivacyPolicy {
	id: number;
	documentId: string;
	text: StrapiBlock[];
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
}

export interface StrapiTermsOfService {
	id: number;
	documentId: string;
	text: StrapiBlock[];
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
}

export interface StrapiContactPage {
	id: number;
	documentId: string;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	phone: string;
	email: string;
	address: string;
}

export interface StrapiTutoringProfile {
	id: number;
	documentId: string;
	name: string;
	/** URL slug for /ozel-ders/[slug]; falls back to documentId when empty. */
	slug?: string | null;
	title: string;
	/** Used for the WhatsApp and call buttons; falls back to the contact page phone. */
	phone?: string | null;
	content: StrapiBlock[];
	/** The API really spells this "experties". */
	experties: string;
	price: number;
	successRate?: number | null;
	studentCount: number;
	/** The API really spells this "exprienceYears". */
	exprienceYears: number;
	createdAt: string;
	updatedAt: string;
	publishedAt: string;
	subjects: StrapiSubject[];
	profilePicture: StrapiImage;
	SEO?: StrapiSEO | null;
}

export interface StrapiResponse<T> {
	data: T;
	meta: any;
}

export interface StrapiCollectionResponse<T> {
	data: T[];
	meta: {
		pagination: {
			page: number;
			pageSize: number;
			pageCount: number;
			total: number;
		};
	};
}

export type CourseStatus = 'not_started' | 'in_progress' | 'completed';
export type QuizStatus = 'not_started' | 'in_progress' | 'completed';

export interface StrapiLessonProgress {
	documentId: string;
	isCompleted: boolean;
}

export interface QuizResult {
	totalQuestions: number;
	correctAnswers: number;
	totalPoints: number;
	earnedPoints: number;
	percentage: number;
	passed: boolean;
	attempts: {
		questionId: number;
		selectedAnswer: string;
		correctAnswer: string;
		isCorrect: boolean;
		explanation: StrapiBlock[];
	}[];
}

export type MyCourse = { documentId: string; status: CourseStatus };

export type TutorRatingSummary = {
	count: number;
	average: number;
	/** Average rating as a percentage of 5 stars; null when there are no reviews. */
	satisfaction: number | null;
};
export type TutorReview = { rating: number; comment: string; author: string; updatedAt: string };
export type MyTutorReview = { rating: number; comment: string };

export const EMPTY_RATING: TutorRatingSummary = { count: 0, average: 0, satisfaction: null };

export const STRAPI_URL = process.env.EXPO_PUBLIC_STRAPI_URL || 'https://admin.ketalearn.cloud';

let authExpiredHandler: (() => void) | null = null;

export function setAuthExpiredHandler(handler: (() => void) | null) {
	authExpiredHandler = handler;
}

function handleAuthExpired() {
	authExpiredHandler?.();
}

/** Resolves Strapi media URLs, which come back relative (`/uploads/...`). */
export function mediaUrl(url?: string | null): string | null {
	if (!url) return null;
	if (/^https?:\/\//.test(url)) return url;
	return `${STRAPI_URL}${url}`;
}

async function fetchStrapiData<T>(endpoint: string, allowForbidden = true): Promise<T> {
	const response = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
		headers: { 'Content-Type': 'application/json' },
	});

	if (response.status === 403 && allowForbidden) {
		return { data: [] } as T;
	}

	if (!response.ok) {
		throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
	}

	return (await response.json()) as T;
}

async function fetchStrapiDataUsingToken<T>(endpoint: string, token: string): Promise<T> {
	const response = await fetch(`${STRAPI_URL}/api/${endpoint}`, {
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
	}

	return (await response.json()) as T;
}

export async function getSettings(): Promise<StrapiSettings> {
	const response = await fetchStrapiData<StrapiResponse<StrapiSettings>>('setting?populate=*');
	if (!response.data?.siteName) {
		throw new Error('Site settings have not been published or are unavailable');
	}
	return response.data;
}

export async function getPageCategories(): Promise<StrapiPageCategory[]> {
	const response = await fetchStrapiData<StrapiResponse<StrapiPageCategory[]>>(
		'page-categories?populate=*',
	);
	return response.data;
}

export async function getPageBySlug(slug: string): Promise<StrapiPage | null> {
	const response = await fetchStrapiData<StrapiResponse<StrapiPage[]>>(
		`pages?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`,
	);
	return response.data.length > 0 ? response.data[0] : null;
}

// `populate=*` only goes one level deep, so the SEO image would be missing.
const COURSE_POPULATE = ['thumbnail', 'image', 'icon', 'subject', 'grades', 'course_lessons']
	.map((field) => `populate[${field}]=true`)
	.concat('populate[SEO][populate]=metaImage')
	.join('&');

export async function getCourse(slug: string): Promise<StrapiCourse | undefined> {
	const response = await fetchStrapiData<StrapiResponse<StrapiCourse[]>>(
		`courses?${COURSE_POPULATE}&filters[slug][$eq]=${slug}`,
	);
	return response.data[0];
}

export async function getLessonsByCourseId(courseId: number): Promise<StrapiCourseLesson[]> {
	// Strapi returns 25 rows per page by default, so walk every page (100 is the max page size).
	const courseLessons: StrapiCourseLesson[] = [];
	for (let page = 1; ; page++) {
		const response = await fetchStrapiData<StrapiCollectionResponse<StrapiCourseLesson>>(
			`course-lessons?populate[lesson][populate][quiz][populate][questions][populate][options]=true&populate[lesson][populate][attachments]=true&populate[lesson][populate][SEO][populate]=metaImage&filters[course][id][$eq]=${courseId}&sort=order:asc&pagination[page]=${page}&pagination[pageSize]=100`,
		);
		// Unpublished (or deleted) lessons come back as `lesson: null`; skip those links.
		courseLessons.push(...response.data.filter((link) => link.lesson));
		if (page >= (response.meta?.pagination?.pageCount ?? 1)) break;
	}
	return courseLessons.sort((a, b) => a.order - b.order);
}

export async function getAllCourseLessons(token: string): Promise<StrapiCourseLesson[]> {
	const lessons: StrapiCourseLesson[] = [];
	let page = 1;
	let pageCount: number;
	do {
		const response = await fetchStrapiDataUsingToken<StrapiCollectionResponse<StrapiCourseLesson>>(
			`course-lessons?populate=*&sort=id:asc&pagination[page]=${page}&pagination[pageSize]=50`,
			token,
		);
		lessons.push(...response.data.filter((link) => link.course && link.lesson));
		pageCount = response.meta.pagination.pageCount;
		page++;
	} while (page <= pageCount);
	return lessons.sort((a, b) => a.order - b.order);
}

export async function getSubjects(): Promise<StrapiSubject[]> {
	const response = await fetchStrapiData<StrapiResponse<StrapiSubject[]>>(
		'subjects?populate[icon]=true&populate[SEO][populate]=metaImage',
	);
	return response.data;
}

export async function getGrades(): Promise<StrapiGrade[]> {
	const response = await fetchStrapiData<StrapiResponse<StrapiGrade[]>>('grades');
	return response.data;
}

/** Published courses with the given documentIds, in the same order as `documentIds`. */
export async function getCoursesByDocumentIds(documentIds: string[]): Promise<StrapiCourse[]> {
	if (!documentIds.length) return [];
	const courses: StrapiCourse[] = [];
	// Chunk to keep the query string short and within the 100-row page size.
	for (let i = 0; i < documentIds.length; i += 50) {
		const filters = documentIds
			.slice(i, i + 50)
			.map((id, index) => `filters[documentId][$in][${index}]=${encodeURIComponent(id)}`)
			.join('&');
		const response = await fetchStrapiData<StrapiResponse<StrapiCourse[]>>(
			`courses?${filters}&populate=*&pagination[pageSize]=100`,
		);
		courses.push(...response.data);
	}
	const position = new Map(documentIds.map((id, index) => [id, index]));
	return courses.sort(
		(a, b) => (position.get(a.documentId) ?? 0) - (position.get(b.documentId) ?? 0),
	);
}

export async function getCourses(): Promise<StrapiCourse[]> {
	const response = await fetchStrapiData<StrapiResponse<StrapiCourse[]>>('courses?populate=*');
	return response.data;
}

export async function getPublishedCourses(limit?: number): Promise<StrapiCourse[]> {
	const courses: StrapiCourse[] = [];
	let page = 1;
	let pageCount: number;
	do {
		const response = await fetchStrapiData<StrapiCollectionResponse<StrapiCourse>>(
			`courses?status=published&populate=*&sort=title:asc&pagination[page]=${page}&pagination[pageSize]=${limit ?? 50}`,
			false,
		);
		courses.push(...response.data);
		pageCount = limit ? 1 : response.meta.pagination.pageCount;
		page++;
	} while (page <= pageCount);
	return courses;
}

export async function getCoursesBySubject(subjectSlug: string): Promise<StrapiCourse[]> {
	const courses: StrapiCourse[] = [];
	for (let page = 1; ; page++) {
		const response = await fetchStrapiData<StrapiCollectionResponse<StrapiCourse>>(
			`courses?filters[subject][slug][$eq]=${encodeURIComponent(subjectSlug)}&populate=*&sort=title:asc&pagination[page]=${page}&pagination[pageSize]=100`,
		);
		courses.push(...response.data);
		if (page >= (response.meta?.pagination?.pageCount ?? 1)) break;
	}
	return courses;
}

export async function getSubjectBySlug(slug: string): Promise<StrapiSubject | undefined> {
	const subjects = await getSubjects();
	return subjects.find((subject) => subject.slug === slug);
}

export async function getPrivacyPolicy(): Promise<StrapiPrivacyPolicy> {
	const response = await fetchStrapiData<StrapiResponse<StrapiPrivacyPolicy>>('privacy-policy');
	return response.data;
}

export async function getTermsAndCondition(): Promise<StrapiTermsOfService> {
	const response =
		await fetchStrapiData<StrapiResponse<StrapiTermsOfService>>('term-and-condition');
	return response.data;
}

async function learningRequest<T>(path: string, token: string, options?: RequestInit): Promise<T> {
	const response = await fetch(`${STRAPI_URL}/api/learning/${path}`, {
		...options,
		headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
	});
	if (response.status === 401 || response.status === 403) handleAuthExpired();
	if (!response.ok) throw new Error(`Learning request failed: ${response.status}`);
	return (await response.json()).data;
}

export async function getUserLessonProgress(
	documentIds: string[] | undefined,
	token: string,
): Promise<StrapiLessonProgress[]> {
	const rows = await learningRequest<StrapiLessonProgress[]>('lesson-progress', token);
	if (!documentIds) return rows;
	const requested = new Set(documentIds);
	return rows.filter((row) => requested.has(row.documentId));
}

/** Courses the signed-in user has started, most recent first. */
export function getMyCourses(token: string) {
	return learningRequest<MyCourse[]>('courses', token);
}

/** Marks a course as started for the signed-in user (idempotent). */
export function startCourse(documentId: string, token: string) {
	return learningRequest<MyCourse>(`courses/${encodeURIComponent(documentId)}/start`, token, {
		method: 'POST',
	});
}

export function updateLessonProgress(documentId: string, isCompleted: boolean, token: string) {
	return learningRequest<StrapiLessonProgress>(
		`lesson-progress/${encodeURIComponent(documentId)}`,
		token,
		{
			method: 'PUT',
			body: JSON.stringify({ isCompleted }),
		},
	);
}

export function submitQuiz(
	documentId: string,
	answers: Record<number, number>,
	submissionId: string,
	token: string,
) {
	return learningRequest<QuizResult>(`quizzes/${encodeURIComponent(documentId)}/attempts`, token, {
		method: 'POST',
		body: JSON.stringify({ answers, submissionId }),
	});
}

export async function getAdmissionScores(): Promise<StrapiAdmissionScore[]> {
	const response = await fetchStrapiData<StrapiResponse<StrapiAdmissionScore[]>>(
		'admission-scores?populate=*',
	);
	return response.data;
}

export async function getAdmissionScoreBySlug(slug: string): Promise<StrapiAdmissionScore | null> {
	const response = await fetchStrapiData<StrapiResponse<StrapiAdmissionScore[]>>(
		`admission-scores?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[university][populate]=*&populate[department][populate]=*&populate[page][populate]=*&populate[related_datas][populate]=*&populate[SEO][populate]=*&fields[0]=id&fields[1]=documentId&fields[2]=title&fields[3]=slug&fields[4]=content&fields[5]=isPopular&fields[6]=createdAt&fields[7]=updatedAt&fields[8]=publishedAt`,
	);
	return response.data.length > 0 ? response.data[0] : null;
}

export async function getAdmissionScoresByPage(pageSlug: string): Promise<StrapiAdmissionScore[]> {
	const response = await fetchStrapiData<StrapiResponse<StrapiAdmissionScore[]>>(
		`admission-scores?filters[page][slug][$eq]=${encodeURIComponent(pageSlug)}&populate[university][populate]=*&populate[department][populate]=*&fields[0]=id&fields[1]=documentId&fields[2]=title&fields[3]=slug&fields[5]=isPopular&fields[6]=createdAt&fields[7]=updatedAt&fields[8]=publishedAt&pagination[pageSize]=100`,
	);
	return response.data;
}

export async function getAdmissionScoreTableDataBySlug(slug: string): Promise<string | null> {
	const response = await fetch(
		`${STRAPI_URL}/api/admission-scores?filters[slug][$eq]=${encodeURIComponent(slug)}&fields[0]=tableData`,
		{ headers: { 'Content-Type': 'application/json' } },
	);
	if (response.status === 403) return null;
	if (!response.ok) throw new Error(`Failed to fetch table data: ${response.statusText}`);
	const data = await response.json();
	return data.data && data.data.length > 0 ? data.data[0].tableData : null;
}

export async function getUniversities(): Promise<StrapiUniversity[]> {
	try {
		const response =
			await fetchStrapiData<StrapiResponse<StrapiUniversity[]>>('universities?populate=*');
		return response.data;
	} catch (error) {
		console.error('Error fetching universities:', error);
		return [];
	}
}

export async function getUniversityBySlug(slug: string): Promise<StrapiUniversity | null> {
	try {
		const response = await fetchStrapiData<StrapiResponse<StrapiUniversity[]>>(
			`universities?filters[slug][$eq]=${slug}&populate=*`,
		);
		return response.data.length > 0 ? response.data[0] : null;
	} catch (error) {
		console.error('Error fetching university by slug:', error);
		return null;
	}
}

export async function getDepartments(): Promise<StrapiDepartment[]> {
	try {
		const response =
			await fetchStrapiData<StrapiResponse<StrapiDepartment[]>>('departments?populate=*');
		return response.data;
	} catch (error) {
		console.error('Error fetching departments:', error);
		return [];
	}
}

export async function getDepartmentBySlug(slug: string): Promise<StrapiDepartment | null> {
	try {
		const response = await fetchStrapiData<StrapiResponse<StrapiDepartment[]>>(
			`departments?filters[slug][$eq]=${slug}&populate=*`,
		);
		return response.data.length > 0 ? response.data[0] : null;
	} catch (error) {
		console.error('Error fetching department by slug:', error);
		return null;
	}
}

export async function getVideos(): Promise<StrapiVideo[]> {
	const response = await fetchStrapiData<StrapiResponse<StrapiVideo[]>>('videos?populate=*');
	return response.data;
}

export async function getVideoBySlug(slug: string): Promise<StrapiVideo | null> {
	const response = await fetchStrapiData<StrapiResponse<StrapiVideo[]>>(
		`videos?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`,
	);
	return response.data.length > 0 ? response.data[0] : null;
}

export async function getVideosByPage(pageSlug: string): Promise<StrapiVideo[]> {
	const response = await fetchStrapiData<StrapiResponse<StrapiVideo[]>>(
		`videos?filters[page][slug][$eq]=${encodeURIComponent(pageSlug)}&populate=*&pagination[pageSize]=100`,
	);
	return response.data;
}

export async function getBlogs(): Promise<StrapiBlog[]> {
	const response = await fetchStrapiData<StrapiResponse<StrapiBlog[]>>('blogs?populate=*');
	return response.data;
}

export async function getBlogBySlug(slug: string): Promise<StrapiBlog | null> {
	const response = await fetchStrapiData<StrapiResponse<StrapiBlog[]>>(
		`blogs?filters[slug][$eq]=${encodeURIComponent(slug)}&populate=*`,
	);
	return response.data.length > 0 ? response.data[0] : null;
}

export async function getBlogsByPage(pageSlug: string): Promise<StrapiBlog[]> {
	const response = await fetchStrapiData<StrapiResponse<StrapiBlog[]>>(
		`blogs?filters[page][slug][$eq]=${encodeURIComponent(pageSlug)}&populate=*&pagination[pageSize]=100`,
	);
	return response.data;
}

const TUTOR_POPULATE =
	'populate[subjects]=true&populate[profilePicture]=true&populate[SEO][populate]=metaImage';

export async function getTutoringProfiles(): Promise<StrapiTutoringProfile[]> {
	const response = await fetchStrapiData<StrapiResponse<StrapiTutoringProfile[]>>(
		`tutoring-profiles?${TUTOR_POPULATE}&pagination[pageSize]=100`,
	);
	return response.data;
}

/** URL segment for a tutor's page: the slug, or the documentId when no slug is set. */
export function tutorPath(tutor: Pick<StrapiTutoringProfile, 'slug' | 'documentId'>) {
	return `/ozel-ders/${encodeURIComponent(tutor.slug || tutor.documentId)}` as const;
}

/** Finds a tutor by slug, falling back to documentId (for tutors without a slug). */
export async function getTutoringProfile(slugOrId: string): Promise<StrapiTutoringProfile | null> {
	const value = encodeURIComponent(slugOrId);
	for (const field of ['slug', 'documentId']) {
		const response = await fetchStrapiData<StrapiResponse<StrapiTutoringProfile[]>>(
			`tutoring-profiles?filters[${field}][$eq]=${value}&${TUTOR_POPULATE}`,
		);
		if (response.data?.length) return response.data[0];
	}
	return null;
}

/** Rating summary of every tutor, keyed by tutor documentId. */
export async function getTutorRatingSummaries(): Promise<Record<string, TutorRatingSummary>> {
	const response = await fetchStrapiData<{
		data: (TutorRatingSummary & { tutorDocumentId: string })[];
	}>('tutor-reviews/summary');
	return Object.fromEntries(
		(response.data ?? []).map(({ tutorDocumentId, ...summary }) => [tutorDocumentId, summary]),
	);
}

async function reviewRequest<T>(
	path: string,
	options: RequestInit = {},
	token?: string,
): Promise<T> {
	const response = await fetch(`${STRAPI_URL}/api/tutor-reviews/${path}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
		},
	});
	if (token && (response.status === 401 || response.status === 403)) handleAuthExpired();
	if (!response.ok) throw new Error(`Review request failed: ${response.status}`);
	return (await response.json()) as T;
}

export function getTutorReviews(tutorDocumentId: string) {
	return reviewRequest<{ data: TutorReview[]; meta: TutorRatingSummary }>(
		encodeURIComponent(tutorDocumentId),
	);
}

export async function getMyTutorReview(tutorDocumentId: string, token: string) {
	const response = await reviewRequest<{ data: MyTutorReview | null }>(
		`${encodeURIComponent(tutorDocumentId)}/mine`,
		{},
		token,
	);
	return response.data;
}

export function saveTutorReview(tutorDocumentId: string, review: MyTutorReview, token: string) {
	return reviewRequest(
		encodeURIComponent(tutorDocumentId),
		{ method: 'PUT', body: JSON.stringify(review) },
		token,
	);
}

export function deleteTutorReview(tutorDocumentId: string, token: string) {
	return reviewRequest(encodeURIComponent(tutorDocumentId), { method: 'DELETE' }, token);
}

export async function getContactPage(): Promise<StrapiContactPage> {
	const response =
		await fetchStrapiData<StrapiResponse<StrapiContactPage>>('contact-page?populate=*');
	return response.data;
}

export interface CourseProgress {
	status: CourseStatus;
	completedLessons: number;
	totalLessons: number;
	lastQuizPercentage: number | null;
}

export async function getCourseProgress(documentId: string, jwt: string): Promise<CourseProgress> {
	const response = await fetch(
		`${STRAPI_URL}/api/learning/course-progress/${encodeURIComponent(documentId)}`,
		{ headers: { Authorization: `Bearer ${jwt}` } },
	);
	if (response.status === 401 || response.status === 403) handleAuthExpired();
	if (!response.ok) throw new Error(`Course progress request failed: ${response.status}`);
	return (await response.json()).data;
}
