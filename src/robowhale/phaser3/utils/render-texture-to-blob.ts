import RenderTexture = Phaser.GameObjects.RenderTexture

type Format = 'image/png' | 'image/jpeg' | string

export function renderTextureToBlob(texture: RenderTexture, format: Format = 'image/png', quality = 1): Promise<Blob> {
	return new Promise<Blob>((resolve, reject) => {
		texture.snapshot(
			async (snapshot: HTMLImageElement) => {
				let base64 = snapshot.src
				let blob = await fetch(base64).then((res) => res.blob())
				resolve(blob)
			},
			format,
			quality
		)
	})
}
