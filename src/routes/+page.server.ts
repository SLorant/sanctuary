import type { PageServerLoad } from './$types';
import fs from 'node:fs';
import path from 'node:path';

const IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp)$/i;

export const load: PageServerLoad = () => {
	const galleryDir = path.join(process.cwd(), 'static', 'gallery');
	const files = fs.readdirSync(galleryDir).filter((file) => IMAGE_EXTENSIONS.test(file));
	const randomFile = files[Math.floor(Math.random() * files.length)];

	return {
		galleryImage: `/gallery/${randomFile}`
	};
};
