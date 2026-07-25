import { error } from '@sveltejs/kit';

export async function load({ params, fetch }) {
	const cardName = decodeURIComponent(params.name);

	try {
		const response = await fetch('/api');
		const cardData = await response.json();

		const card = cardData.cards.find(
			(c: { name: string; desc: string }) => c.name.toLowerCase() === cardName.toLowerCase()
		);

		if (!card) {
			throw error(404, 'Card not found');
		}

		return {
			card
		};
	} catch (e) {
		throw error(500, 'Failed to load card data');
	}
}
