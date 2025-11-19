import { asText } from '@prismicio/client';
import { createClient } from '$lib/prismicio';

export async function load({ fetch, cookies }) {
	const client = createClient({ fetch, cookies });
	const page = await client.getSingle('home');
	const speakers = await client.getAllByType('speakers');
	const sponsors = await client.getAllByType('sponsors');
	const talks = await client.getAllByType('talk');

	const sortedSpeakers = speakers.sort((a, b) => {
		const nameA = a.data.name?.toLowerCase() || '';
		const nameB = b.data.name?.toLowerCase() || '';
		return nameA.localeCompare(nameB);
	});

	return {
		page,
		speakers: sortedSpeakers,
		sponsors,
		talks,
		title: page.data.meta_title,
		meta_description: page.data.meta_description,
		meta_title: page.data.meta_title,
		meta_image: page.data.meta_image.url
	};
}

export function entries() {
	return [{}];
}