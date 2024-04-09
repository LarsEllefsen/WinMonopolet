export const deepCopyClass = <T>(clazz: T) => {
	return Object.assign(Object.create(Object.getPrototypeOf(clazz)), clazz) as T;
};
