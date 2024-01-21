export const toSnakeCase = (str: string) => {
	if (str.includes(',') || str.includes(' ') || str.includes('&')) {
		if (str.includes('.')) {
			str = str.substring(0, str.length - 1);
		}
		return str.replace(/[,& ]+/g, '_');
	} else {
		return str;
	}
};
