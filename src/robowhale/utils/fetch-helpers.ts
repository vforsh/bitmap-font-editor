export async function fetchJson(input: RequestInfo, init?: RequestInit): Promise<any> {
	let response = await fetch(input, init)
	if (response.ok === false) {
		return Promise.reject(response.statusText)
	}

	return response.json()
}

export async function fetchBlob(input: RequestInfo, init?: RequestInit): Promise<Blob> {
	let response = await fetch(input, init)
	if (response.ok === false) {
		return Promise.reject(response.statusText)
	}

	return response.blob()
}

export async function fetchText(input: RequestInfo, init?: RequestInit): Promise<string> {
	let response = await fetch(input, init)
	if (response.ok === false) {
		return Promise.reject(response.statusText)
	}

	return response.text()
}
