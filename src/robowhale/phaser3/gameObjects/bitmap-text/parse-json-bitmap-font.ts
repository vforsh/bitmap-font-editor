import { BmFontData } from "../../../../scenes/bitmapFontEditor/create-bmfont-data"

type PhaserBmfontData = Phaser.Types.GameObjects.BitmapText.BitmapFontData

/**
 * Parse an JSON to Bitmap Font data for the Bitmap Font cache.
 *
 * @param {BmFontData} json - The XML Document to parse the font from.
 * @param {Phaser.Textures.Frame} frame - The texture frame to take into account when creating the uv data.
 * @param {Phaser.Textures.Texture} [texture] - If provided, each glyph in the Bitmap Font will be added to this texture as a frame.
 *
 * @return {Phaser.Types.GameObjects.BitmapText.BitmapFontData} The parsed Bitmap Font data.
 */
export function parseJsonBitmapFont(json: BmFontData, frame: Phaser.Textures.Frame, texture?: Phaser.Textures.Texture): PhaserBmfontData {
	let textureX = frame.cutX
	let textureY = frame.cutY
	let textureWidth = frame.source.width
	let textureHeight = frame.source.height
	let sourceIndex = frame.sourceIndex
	
	let [xSpacing, ySpacing] = json.info.spacing
	
	let data: Partial<PhaserBmfontData> = {}
	data.font = json.info.face
	data.size = json.info.size
	data.lineHeight = json.common.lineHeight + ySpacing
	data.chars = {}
	
	let top = 0
	let left = 0
	
	let adjustForTrim = frame.trimmed
	if (adjustForTrim) {
		top = frame.height
		left = frame.width
	}
	
	let letters = json.chars.list
	for (let i = 0; i < letters.length; i++) {
		let node = letters[i]
		
		let charCode = getValue(node, "id")
		let letter = String.fromCharCode(charCode)
		let gx = getValue(node, "x")
		let gy = getValue(node, "y")
		let gw = getValue(node, "width")
		let gh = getValue(node, "height")
		
		//  Handle frame trim issues
		
		if (adjustForTrim) {
			if (gx < left) {
				left = gx
			}
			
			if (gy < top) {
				top = gy
			}
		}
		
		if (adjustForTrim && top !== 0 && left !== 0) {
			//  Now we know the top and left coordinates of the glyphs in the original data
			//  so we can work out how much to adjust the glyphs by
			gx -= frame.x
			gy -= frame.y
		}
		
		let u0 = (textureX + gx) / textureWidth
		let v0 = (textureY + gy) / textureHeight
		let u1 = (textureX + gx + gw) / textureWidth
		let v1 = (textureY + gy + gh) / textureHeight
		
		data.chars[charCode] = {
			x: gx,
			y: gy,
			width: gw,
			height: gh,
			centerX: Math.floor(gw / 2),
			centerY: Math.floor(gh / 2),
			xOffset: getValue(node, "xoffset"),
			yOffset: getValue(node, "yoffset"),
			// @ts-ignore
			xAdvance: getValue(node, "xadvance") + xSpacing,
			data: {},
			kerning: {},
			u0: u0,
			v0: v0,
			u1: u1,
			v1: v1,
		}
		
		if (texture && gw !== 0 && gh !== 0) {
			let charFrame = texture.add(letter, sourceIndex, gx, gy, gw, gh)
			if (charFrame) {
				charFrame.setUVs(gw, gh, u0, v0, u1, v1)
			}
		}
	}
	
	let kernings = json.kernings.list
	for (let i = 0; i < kernings.length; i++) {
		let kern = kernings[i]
		
		let first = kern.first
		let second = kern.second
		data.chars[second].kerning[first] = kern.amount
	}
	
	return data as PhaserBmfontData
}

function getValue(node, prop: string): number {
	return parseInt(node[prop])
}
