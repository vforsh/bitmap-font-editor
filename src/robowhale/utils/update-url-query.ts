export function updateUrlQuery(key: string, value?: string): string {
	let query = new URLSearchParams(window.location.search)

	if (value) {
		query.set(key, value)
	} else {
		query.delete(key)
	}

	return window.location.protocol + '//' + window.location.host + window.location.pathname + '?' + query.toString()
}
