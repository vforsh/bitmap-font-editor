declare class RexToast {
	constructor(scene: Phaser.Scene, config: RexToastConfig)
	layout(): void
	show(message: string | RexToastShowCallback): RexToast
}

declare interface RexToastConfig {
	x?: number
	y?: number
	width: number
	height: number
	anchor?: Partial<RexAnchorConfig>
	space?: Partial<RexToastSpaceConfig>
	orientation?: 0
	background?: Phaser.GameObjects.GameObject
	icon?: Phaser.GameObjects.GameObject
	iconMask?: boolean
	text?: Phaser.GameObjects.Text | Phaser.GameObjects.BitmapText
	action?: Phaser.GameObjects.GameObject
	actionMask?: boolean
	duration?: {
		in: number
		hold: number
		out: number
	}

	transitIn?: 0 | 1 | RexToastTransitionCallback
	transitOut?: 0 | 1 | RexToastTransitionCallback

	name?: string
}

interface RexToastSpaceConfig {
	left: number
	right: number
	top: number
	bottom: number

	icon: number
	text: number
}

type RexToastTransitionCallback = (gameObject, duration) => void

type RexToastShowCallback = (toast: RexToast) => void
