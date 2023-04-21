import { AutoSizeTextOptions } from './AutoSizeText'

// it is VERY slow so use it sparingly
export function fitText(text: Phaser.GameObjects.Text, options: Omit<AutoSizeTextOptions, 'applyOnTextUpdate'>) {
	let { maxWidth, maxHeight, useAdvancedWrap = false } = options
	let iterations = Math.max(2, options.iterations ?? 4) // can't have less than 2 iterations, because it will produce poor results and 4 is a good default

	text.setScale(1)
	text.setWordWrapWidth(null)

	if (text.width > maxWidth) {
		text.setWordWrapWidth(maxWidth, useAdvancedWrap)
	}

	let lastScale = 1
	let i = iterations - 1
	while (i-- && text.displayHeight > maxHeight) {
		let deltaHeight = text.displayHeight - maxHeight
		let newHeight = maxHeight + deltaHeight / 2
		let scale = (newHeight / text.displayHeight) * lastScale
		text.setScale(scale)
		text.setWordWrapWidth(maxWidth / scale, useAdvancedWrap)
		lastScale = scale
	}

	if (text.displayHeight > maxHeight) {
		let scale = (maxHeight / text.displayHeight) * lastScale
		text.setScale(scale)
		text.setWordWrapWidth(maxWidth / scale, useAdvancedWrap)
	}
}
