import { Word } from '@modules/wordlist/entities/word';

export const stripWords = (
	baseString: string,
	wordsToStripFromBaseString: Word[],
) => {
	const re = new RegExp(
		'\\b(' +
			wordsToStripFromBaseString.map((word) => word.value).join('|') +
			')\\b',
		'ig',
	);
	const strippedBaseString = (baseString || '')
		.replace(re, '')
		.replace(/[]{2,}/, '');
	return strippedBaseString;
};
