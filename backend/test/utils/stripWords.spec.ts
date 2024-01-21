import { Word } from '@modules/wordlist/entities/word';
import { stripWords } from '@utils/stripWords';
import { createMockWord } from './mockData';

describe('stripWords', () => {
	it('should strip all occurences of the words from the string', () => {
		const baseString = 'Brewheart x LaQuince Spaceman DDH IPA';
		const words = [createMockWord('x'), createMockWord('DDH')];

		const strippedString = stripWords(baseString, words);

		expect(strippedString).toBe('Brewheart  LaQuince Spaceman  IPA');
	});

	it('should not remove words that occurs as a substring', () => {
		const baseString = 'Excelsior DIPA';
		const words = [createMockWord('x'), createMockWord('IPA')];

		const strippedString = stripWords(baseString, words);

		expect(strippedString).toBe('Excelsior DIPA');
	});

	it('Order of words should not matter', () => {
		const baseString = 'Lars Imperial Pastry Stout';
		const words = [
			createMockWord('Stout'),
			createMockWord('Imperial'),
			createMockWord('Pastry'),
		];

		const strippedString = stripWords(baseString, words);

		expect(strippedString).toBe('Lars   ');
	});

	it('should ignore words that do not occur in the string', () => {
		const baseString = 'Lars Imperial Pastry Stout';
		const words = [
			createMockWord('DIPA'),
			createMockWord('Hazy'),
			createMockWord('Stout'),
		];

		const strippedString = stripWords(baseString, words);

		expect(strippedString).toBe('Lars Imperial Pastry ');
	});
});
