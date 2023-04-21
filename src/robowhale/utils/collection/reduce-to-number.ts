export function reduceToNumber<T>(array: T[], predicate: (item: T, index?: number) => number): number {
	let len = array.length

	let acc = 0
	for (let i = 0; i < len - 1; i++) {
		acc += predicate(array[i], i)
	}

	return acc
}
