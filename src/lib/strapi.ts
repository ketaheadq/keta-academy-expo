const STRAPI_URL = process.env.EXPO_PUBLIC_STRAPI_URL || 'https://admin.ketaakademi.com';

export async function fetchStrapiData<T>(endpoint: string): Promise<T> {
	try {
		const fullUrl = `${STRAPI_URL}/api/${endpoint}`;
		const response = await fetch(fullUrl, {
			headers: {
				'Content-Type': 'application/json',
			},
		});

		if (!response.ok) {
			throw new Error(`Failed to fetch data: ${response.statusText}`);
		}

		return await response.json();
	} catch (error) {
		console.error('Error fetching Strapi data:', error);
		throw error;
	}
}

export async function getCourses() {
	const response = await fetchStrapiData<any>('courses?populate=*');
	return response.data;
}

export async function getBlogs() {
	const response = await fetchStrapiData<any>('blogs?populate=*');
	return response.data;
}

export async function getSettings() {
	const response = await fetchStrapiData<any>('setting?populate=*');
	return response.data;
}
