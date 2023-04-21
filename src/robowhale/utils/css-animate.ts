export function cssAnimate(element: HTMLElement, animation: string, durationMs?: number): Promise<void> {
	if (typeof element.onanimationend === 'undefined') {
		return Promise.resolve()
	}

	if (typeof durationMs === 'number') {
		element.style.setProperty('--animate-duration', `${durationMs / 1000}s`)
	}

	return new Promise((resolve) => {
		element.classList.add('animate__animated', animation)
		element.onanimationend = () => {
			element.classList.remove(animation)
			resolve()
		}
	})
}
