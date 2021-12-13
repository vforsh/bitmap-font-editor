type ObjectKeys<T> =
	T extends object ? (keyof T)[] :
		T extends number ? [] :
			T extends Array<any> | string ? string[] :
				never;

export function getObjectKeys<T>(obj: T): ObjectKeys<T> {
	return Object.keys(obj) as ObjectKeys<T>
}
