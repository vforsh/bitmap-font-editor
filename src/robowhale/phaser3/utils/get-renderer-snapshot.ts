type PhaserRenderer = Phaser.Renderer.Canvas.CanvasRenderer | Phaser.Renderer.WebGL.WebGLRenderer
type Format = "image/png" | "image/jpeg"

export function getRendererSnapshot(renderer: PhaserRenderer, format: Format = "image/png", quality: number = 1): Promise<Blob> {
	return new Promise<Blob>((resolve, reject) => {
		renderer.snapshot(async (snapshot: HTMLImageElement) => {
			let screenshotBase64 = snapshot.src
			let blob = await fetch(screenshotBase64).then(res => res.blob())
			resolve(blob)
		}, format, quality)
	})
}
