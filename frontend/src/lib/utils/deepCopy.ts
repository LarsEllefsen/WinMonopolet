export const deepCopy = <T>(object: object) => JSON.parse(JSON.stringify(object)) as T;
