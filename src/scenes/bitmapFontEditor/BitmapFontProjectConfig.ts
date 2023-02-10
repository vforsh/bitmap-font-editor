import { PackingMethod } from "./panels/LayoutPanel"
import { BitmapTextAlign } from "./panels/PreviewPanel"
import Vector2Like = Phaser.Types.Math.Vector2Like

export type RGB = {
	r: number
	g: number
	b: number
}
export type RGBA = RGB & {
	a: number
}

export interface BitmapFontProjectConfig {
	content: {
		content: string
	},
	font: {
		family: string
		weight: number
		size: number
		lineHeight: number
		resolution: number
		color: RGBA
		padding: Vector2Like
		spacing: Vector2Like
	},
	stroke: {
		color: RGBA
		thickness: number
	},
	shadow: {
		x: number
		y: number
		color: RGBA
		blur: number
		shadowStroke: boolean
		shadowFill: boolean
	},
	glow: {
		enabled: boolean
		quality: number
		distance: number
		innerStrength: number
		outerStrength: number
		color: RGB
	},
	layout: {
		bgColor: RGB
		method: PackingMethod
	},
	import: {
		project: string
		custom: string
	},
	export: {
		name: string
		type: "json" | "xml"
		config: string
		texture: string
		texturePacker: string
	},
	preview: {
		align: BitmapTextAlign
		maxWidth: number
		letterSpacing: number
		fontSize: number
		content: string
		debug: boolean
		debugColor: RGBA
	},
}

export const DEFAULT_CONFIG: BitmapFontProjectConfig = Object.freeze({
	content: {
		content: "",
	},
	font: {
		family: "Arial",
		weight: 400,
		size: 40,
		lineHeight: 1,
		resolution: 1.5,
		color: { r: 255, g: 255, b: 255, a: 1 },
		padding: { x: 0, y: 0 },
		spacing: { x: 0, y: 0 },
	},
	stroke: {
		color: { r: 0, g: 0, b: 0, a: 1 },
		thickness: 0,
	},
	shadow: {
		x: 0,
		y: 0,
		color: { r: 0, g: 0, b: 0, a: 1 },
		blur: 0,
		shadowStroke: false,
		shadowFill: true,
	},
	glow: {
		enabled: false,
		quality: 0.25,
		distance: 10,
		innerStrength: 0,
		outerStrength: 2,
		color: { r: 255, g: 255, b: 255 },
	},
	layout: {
		bgColor: { r: 104, g: 104, b: 104 },
		method: PackingMethod.ROW,
	},
	import: {
		project: "",
		custom: "",
	},
	export: {
		name: "",
		type: "json",
		config: "",
		texture: "",
		texturePacker: "",
	},
	preview: {
		debug: true,
		debugColor: { r: 255, g: 255, b: 255, a: 0.25 },
		align: BitmapTextAlign.CENTER,
		maxWidth: 0,
		letterSpacing: 0,
		fontSize: 30,
		content: "",
	},
} as const)
