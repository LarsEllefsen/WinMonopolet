export const delayExecution = async <T>(
	fn: () => Promise<T>,
	delay: number,
): Promise<T> => {
	const val = await fn();
	return new Promise((resolve) => {
		setTimeout(() => resolve(val), delay);
	});
};
