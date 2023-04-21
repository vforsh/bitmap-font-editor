export function reverseMap<K extends PropertyKey, V extends PropertyKey>(map: Record<K, V>): Record<V, K> {
	let reversedMap: Record<V, K> = Object.create(null)

	for (let key in map) {
		let value = map[key]
		reversedMap[value] = key
	}

	return reversedMap
}
