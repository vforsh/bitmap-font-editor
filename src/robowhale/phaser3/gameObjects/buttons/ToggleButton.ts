import { SimpleButton } from './SimpleButton'

export enum ToggleButtonState {
	STATE_1 = 1,
	STATE_2 = 2,
}

export class ToggleButton extends SimpleButton {
	private frame_1: string
	private frame_2: string
	protected _buttonState: ToggleButtonState

	constructor(scene: Phaser.Scene, texture: string, frame_1: string, frame_2: string, parent?: Phaser.GameObjects.Container) {
		super(scene, texture, frame_1, parent)

		this.frame_1 = frame_1
		this.frame_2 = frame_2
		this._buttonState = ToggleButtonState.STATE_1
	}

	protected onPointerUp(): void {
		super.onPointerUp()

		this.toggleFrames()
	}

	private toggleFrames(): void {
		this.buttonState = this._buttonState === ToggleButtonState.STATE_1 ? ToggleButtonState.STATE_2 : ToggleButtonState.STATE_1
	}

	public get buttonState(): ToggleButtonState {
		return this._buttonState
	}

	public set buttonState(value: ToggleButtonState) {
		this._buttonState = value
		this._buttonState === ToggleButtonState.STATE_1 ? this.setFrame(this.frame_1) : this.setFrame(this.frame_2)
	}
}
