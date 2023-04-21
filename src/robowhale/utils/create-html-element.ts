export function createHtmlElement<T extends HTMLElement>(html: string): T {
	let div = document.createElement('div')
	div.innerHTML = html.trim()

	return div.firstChild as T
}
