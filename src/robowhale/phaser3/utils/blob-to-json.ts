export function blobToJson(blob: Blob): Promise<object> {
	return new Promise<object>((resolve, reject) => {
		try {
			let reader = new FileReader()
			reader.onload = () => resolve(JSON.parse(reader.result as string))
			reader.readAsText(blob)
		} catch (error) {
			reject(error)
		}
	})
}

export function blobToString(blob: Blob): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		try {
			let reader = new FileReader()
			reader.onload = () => resolve(reader.result as string)
			reader.readAsText(blob)
		} catch (error) {
			reject(error)
		}
	})
}

export function blobToImage(blob: Blob): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		let url = URL.createObjectURL(blob)
		let image = new Image()

		image.onload = () => {
			URL.revokeObjectURL(url)
			resolve(image)
		}

		image.onerror = () => {
			URL.revokeObjectURL(url)
			reject()
		}

		image.src = url

		if (image.complete && image.width && image.height) {
			image.onload = null
			image.onerror = null

			resolve(image)
		}
	})
}
