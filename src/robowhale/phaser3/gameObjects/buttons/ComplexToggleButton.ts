import { ComplexButton } from './ComplexButton'
import { ToggleButtonState } from './ToggleButton'

export class ComplexToggleButton extends ComplexButton {
	private _buttonState: ToggleButtonState

	constructor(scene: Phaser.Scene, atlas: string, backFrame: string, parent?: Phaser.GameObjects.Container) {
		super(scene, atlas, backFrame, parent)

		this._buttonState = ToggleButtonState.STATE_1
		this.setViewByState(this._buttonState)
	}

	protected onPointerUp(): void {
		super.onPointerUp()

		this.toggleState()
	}

	private toggleState(): void {
		this.buttonState = this._buttonState === ToggleButtonState.STATE_1 ? ToggleButtonState.STATE_2 : ToggleButtonState.STATE_1
	}

	public get buttonState(): ToggleButtonState {
		return this._buttonState
	}

	public set buttonState(value: ToggleButtonState) {
		if (this._buttonState === value) {
			return
		}

		this._buttonState = value
		this.setViewByState(this._buttonState)
	}

	protected setViewByState(state: ToggleButtonState) {}
}
