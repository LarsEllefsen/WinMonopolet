export const getReadableDateFormat = (date: Date) =>
	`${date.getDate()} ${date.toLocaleDateString('nb-NO', { month: 'long' })} ${date.getFullYear()}`;
