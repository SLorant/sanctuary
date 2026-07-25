import { json } from '@sveltejs/kit';
import cardData from './cards.json';

export async function GET() {
	return json(cardData);
}
