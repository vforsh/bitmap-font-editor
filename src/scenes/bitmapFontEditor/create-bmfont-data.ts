import { without } from 'lodash-es'
import { Font } from 'opentype.js'
import { BitmapFontTexture } from './BitmapFontEditor'
import { BitmapFontProjectConfig } from './BitmapFontProjectConfig'

export type BmFontInfo = {
	face: string
	size: number
	bold: 0 | 1
	italic: 0 | 1
	charset: string
	unicode: string
	stretchH: number
	smooth: 0 | 1
	aa: 0 | 1
	padding: [number, number, number, number]
	spacing: [number, number]
	outline: number
}

export type BmFontCommon = {
	lineHeight: number
	base: number
	scaleW: number
	scaleH: number
	pages: number
	packed: 0 | 1
}

export interface BmFontPage extends Record<string, unknown> {
	id: number
	file: string
}

export type BmFontChars = {
	count: number
	list: BmFontChar[]
}

export interface BmFontChar extends Record<string, unknown> {
	char: string
	id: number
	// source: HTMLImageElement | HTMLCanvasElement | null
	x: number
	y: number
	width: number
	height: number
	xoffset: number
	yoffset: number
	xadvance: number
	page: number
	chnl: 1 | 2 | 4 | 8 | 15
}

export type BmFontKernings = {
	count: number
	list: BmFontKerning[]
}

export interface BmFontKerning extends Record<string, unknown> {
	first: number
	second: number
	amount: number
}

export interface BmFontData {
	info: BmFontInfo
	common: BmFontCommon
	pages: BmFontPage[]
	chars: BmFontChars
	kernings: BmFontKernings
	extra?: {
		atlas: string
		texture: string
		texturePacker: string
	}
}

export function createBmfontData(config: BitmapFontProjectConfig, glyphs: Phaser.GameObjects.Text[], texture: BitmapFontTexture, font: Font): BmFontData {
	if (glyphs.length === 0) {
		return null
	}

	let fontSize = config.font.size
	let padding = config.font.padding
	let spacing = config.font.spacing
	let baselines = getFontBaselines(font, fontSize)

	let lineHeight = Math.max(...glyphs.map((g) => g.displayHeight))
	let fullLineHeight = Math.ceil(lineHeight * config.font.lineHeight)
	let yOffset = Math.round((fullLineHeight - lineHeight) / 2)

	// http://www.angelcode.com/products/bmfont/doc/file_format.html
	return {
		info: {
			aa: 0,
			bold: 0,
			charset: '',
			face: config.font.family,
			italic: 0,
			outline: config.stroke.thickness,
			padding: [padding.y, padding.x, padding.y, padding.x], //  up, right, down, left
			spacing: [spacing.x, spacing.y],
			size: fontSize,
			smooth: 1,
			unicode: '',
			stretchH: 100,
		},
		common: {
			lineHeight: fullLineHeight,
			base: Math.round(baselines.alphabetic - baselines.top),
			pages: 1,
			packed: 0,
			scaleW: Math.ceil(texture.width),
			scaleH: Math.ceil(texture.height),
		},
		pages: [
			{
				id: 0,
				file: config.export.texture.split('/').pop(), // e.g. top_labels.png
			},
		],
		chars: createChars(glyphs, fullLineHeight, texture.padding, 0, yOffset),
		kernings: createKernings(glyphs, font, fontSize),
	}
}

function getFontBaselines(font: Font, fontSize: number) {
	const scale = fontSize / font.unitsPerEm
	const height = font.ascender - font.descender
	const fontHeight = height * scale
	const alphabetic = font.ascender * scale

	return {
		middle: 0,
		hanging: 0,
		top: fontHeight / -2,
		alphabetic: alphabetic - fontHeight / 2,
		ideographic: 0,
		bottom: fontHeight / 2,
		lineHeight: height / font.unitsPerEm,
	}
}

function createChars(glyphs: Phaser.GameObjects.Text[], height: number, texturePadding, xOffset = 0, yOffset = 0): BmFontChars {
	let list: BmFontChar[] = glyphs.map((text) => {
		return {
			char: text.text,
			x: text.x + texturePadding,
			y: text.y + texturePadding,
			id: text.text.charCodeAt(0),
			chnl: 15,
			width: Math.ceil(text.width),
			height: height,
			page: 0,
			xadvance: text.width, // TODO how to calculate xadvance ???
			xoffset: xOffset, // TODO how to calcualte xoffset ???
			yoffset: yOffset, // TODO how to calcualte yoffset ???
		}
	})

	return { count: list.length, list }
}

// https://github.com/SilenceLeo/snowb-bmf/blob/1b784da754b10ca18bcb7cfd498a6394b58de3f1/src/file/export/toBmfInfo.ts#L94
function createKernings(glyphs: Phaser.GameObjects.Text[], font: Font, fontSize: number): BmFontKernings {
	let glyphIndexToCharMap: Map<number, string> = new Map<number, string>()
	let glyphIndices = glyphs.map((glyph) => {
		let char = glyph.text
		let glyphIndex = font.charToGlyphIndex(char)

		glyphIndexToCharMap.set(glyphIndex, char)

		return glyphIndex
	})

	let pairs = glyphIndices.flatMap((glyphIndex) => {
		let otherGlyphs = without(glyphIndices, glyphIndex)
		return otherGlyphs.map((otherGlyph) => [glyphIndex, otherGlyph])
	})

	let fontScale = (1 / font.unitsPerEm) * fontSize

	let list: BmFontKerning[] = pairs
		.map(([left, right]) => {
			let kerning = font.getKerningValue(left, right)
			let amount = Math.round(kerning * fontScale)
			if (amount) {
				return {
					first: glyphIndexToCharMap.get(left).charCodeAt(0),
					second: glyphIndexToCharMap.get(right).charCodeAt(0),
					amount,
				}
			}
		})
		.filter(Boolean)

	return { count: list.length, list }
}
