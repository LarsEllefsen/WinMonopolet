import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const STORAGE_KEY = 'winmonopolet.had-beers';
const STORAGE_VERSION = 1;

type PersistedHadBeers = {
	version: number;
	beers: { bid: string; rating: number | null }[];
};

export type HadBeers = Map<string, number | null>;

const getLocalStorage = (): Storage | undefined => {
	if (!browser || typeof localStorage === 'undefined') return undefined;
	return localStorage;
};

const readFromStorage = (): HadBeers => {
	const storage = getLocalStorage();
	if (!storage) return new Map();

	try {
		const parsed: unknown = JSON.parse(storage.getItem(STORAGE_KEY) ?? 'null');
		if (typeof parsed !== 'object' || parsed === null) return new Map();

		const { version, beers } = parsed as PersistedHadBeers;
		if (version !== STORAGE_VERSION || !Array.isArray(beers)) return new Map();

		return beers.reduce((map, { bid, rating }) => {
			if (typeof bid === 'string') map.set(bid, rating ?? null);
			return map;
		}, new Map<string, number | null>());
	} catch {
		return new Map();
	}
};

const persistToStorage = (beers: HadBeers) => {
	const storage = getLocalStorage();
	if (!storage) return;

	const payload: PersistedHadBeers = {
		version: STORAGE_VERSION,
		beers: Array.from(beers, ([bid, rating]) => ({ bid, rating }))
	};
	storage.setItem(STORAGE_KEY, JSON.stringify(payload));
};

export const hadBeers = writable<HadBeers>(readFromStorage());

const coerceBid = (value: unknown): string | null => {
	if (typeof value === 'string' && value.length > 0) return value;
	if (typeof value === 'number' && Number.isFinite(value)) return String(value);
	return null;
};

const coerceRating = (value: unknown): number | null => {
	return typeof value === 'number' && Number.isFinite(value) ? value : null;
};

export const parseHadBeers = (data: unknown): HadBeers => {
	if (!Array.isArray(data)) {
		throw new Error('Ugyldig fil: forventet en JSON-array med øl.');
	}

	return data.reduce((beers, entry: unknown, index: number) => {
		if (typeof entry !== 'object' || entry === null) {
			throw new Error(`Ugyldig fil: element ${index + 1} er ikke et objekt.`);
		}
		const bid = coerceBid((entry as Record<string, unknown>).bid);
		if (bid === null) {
			throw new Error(`Ugyldig fil: element ${index + 1} mangler "bid".`);
		}
		beers.set(bid, coerceRating((entry as Record<string, unknown>).yourRating));
		return beers;
	}, new Map<string, number | null>());
};

export const importHadBeersFromFile = async (file: File): Promise<number> => {
	let data: unknown;
	try {
		data = JSON.parse(await file.text());
	} catch {
		throw new Error('Ugyldig fil: ikke gyldig JSON.');
	}

	const beers = parseHadBeers(data);
	hadBeers.set(beers);
	persistToStorage(beers);
	return beers.size;
};

export const clearHadBeers = () => {
	hadBeers.set(new Map());
	getLocalStorage()?.removeItem(STORAGE_KEY);
};
