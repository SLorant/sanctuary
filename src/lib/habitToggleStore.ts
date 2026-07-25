import { writable } from 'svelte/store';

export const habitToggled = writable<number>(0);
