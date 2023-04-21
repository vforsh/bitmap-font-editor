export function countWhere<T>(array: T[], predicate: (item: T, index?: number) => boolean): number {
	let counter = 0
	let length = array.length

	for (let i = 0; i < length; i++) {
		if (predicate(array[i], i)) {
			counter++
		}
	}

	return counter
}
