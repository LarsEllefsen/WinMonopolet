import { stripWords } from '@utils/stripWords';
import { createMockWord } from './createMockData';

describe('stripWords', () => {
	it('should strip all occurences of the words from the string', () => {
		const baseString = 'Brewheart x LaQuince Spaceman DDH IPA';
		const words = [createMockWord(1, 'x'), createMockWord(2, 'DDH')];

		const strippedString = stripWords(baseString, words);

		expect(strippedString).toBe('Brewheart  LaQuince Spaceman  IPA');
	});

	it('should not remove words that occurs as a substring', () => {
		const baseString = 'Excelsior DIPA';
		const words = [createMockWord(1, 'x'), createMockWord(2, 'IPA')];

		const strippedString = stripWords(baseString, words);

		expect(strippedString).toBe('Excelsior DIPA');
	});

	it('Order of words should not matter', () => {
		const baseString = 'Lars Imperial Pastry Stout';
		const words = [
			createMockWord(1, 'Stout'),
			createMockWord(2, 'Imperial'),
			createMockWord(3, 'Pastry'),
		];

		const strippedString = stripWords(baseString, words);

		expect(strippedString).toBe('Lars   ');
	});

	it('should ignore words that do not occur in the string', () => {
		const baseString = 'Lars Imperial Pastry Stout';
		const words = [
			createMockWord(1, 'DIPA'),
			createMockWord(2, 'Hazy'),
			createMockWord(3, 'Stout'),
		];

		const strippedString = stripWords(baseString, words);

		expect(strippedString).toBe('Lars Imperial Pastry ');
	});
});
