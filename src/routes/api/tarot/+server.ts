import { json } from '@sveltejs/kit';
import cardData from '../cards.json';
import { tarotDb } from '$lib/server/db';

interface TarotCard {
	name: string;
	desc: string;
}

export async function GET() {
	const today = new Date().toISOString().split('T')[0];

	// Check if we already have a draw for today
	let tarotDraw = tarotDb.getByDate(today);

	if (!tarotDraw) {
		// No draw for today, pick a random card
		const cards = cardData.cards;
		const randomIndex = Math.floor(Math.random() * cards.length);
		const card = cards[randomIndex] as TarotCard;

		// Save to database
		tarotDb.create(today, card.name, card.desc);

		return json({
			name: card.name,
			desc: card.desc
		});
	}

	return json({
		name: tarotDraw.cardName,
		desc: tarotDraw.cardDesc
	});
}
