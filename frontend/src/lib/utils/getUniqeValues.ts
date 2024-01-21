export const getUniqueStringValues = <T>(iterable: T[], propertyName: keyof T): string[] => {
	return [...new Set(iterable.map((item) => item[propertyName]))] as string[];
};
