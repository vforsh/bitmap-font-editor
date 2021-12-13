export function pullFast<T>(array: T[], item: T): void {
	let index = array.indexOf(item)
	if (index > -1) {
		array[index] = array[array.length - 1]
		array.length--
	}
}
