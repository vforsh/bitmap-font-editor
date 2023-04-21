type Format = 'image/png' | 'image/jpeg' | string

export function canvasToImg(canvas: HTMLCanvasElement, type?: Format, quality?: number): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		let img = new Image(canvas.width, canvas.height)
		img.onerror = () => {
			reject()
		}
		img.onload = () => {
			resolve(img)
		}

		img.src = canvas.toDataURL(type, quality)
	})
}
