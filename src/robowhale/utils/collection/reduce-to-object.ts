export function reduceToObject<T extends PropertyKey, U>(array: T[], callback: (item: T, index?: number) => U): Record<T, U> {
	return array.reduce((acc, item, index) => {
		acc[item] = callback(item, index)
		return acc
	}, {} as Record<T, U>)
}
