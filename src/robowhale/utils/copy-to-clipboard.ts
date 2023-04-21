export function fallbackCopyToClipboard(text: string): boolean {
	let textArea = document.createElement('textarea')
	textArea.value = text

	// Avoid scrolling to bottom
	textArea.style.top = '0'
	textArea.style.left = '0'
	textArea.style.position = 'fixed'
	textArea.setAttribute('readonly', '')

	document.body.appendChild(textArea)
	textArea.focus()
	textArea.select()

	let result: boolean = false
	try {
		result = document.execCommand('copy')
	} catch (error) {
		console.error('Fallback: Oops, unable to copy', error)
	}

	document.body.removeChild(textArea)
	return result
}

export function copyToClipboard(text: string): Promise<void> {
	if (!navigator.clipboard) {
		let result = fallbackCopyToClipboard(text)
		return result ? Promise.resolve() : Promise.reject()
	}

	return navigator.clipboard.writeText(text)
}
