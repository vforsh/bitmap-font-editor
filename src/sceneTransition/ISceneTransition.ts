import { SceneKey } from "../scenes/SceneKey"
import GameObject = Phaser.GameObjects.GameObject

export enum SceneTransitionEvent {
	START = "start",
	COMPLETE = "complete",
}

export interface ISceneTransition extends GameObject {
	visible: boolean
	instantChange: boolean
	changeScene(currentSceneKey: SceneKey, newSceneKey: SceneKey, newSceneData?: object): void
	resize(): void
	setDepth(depth: number)
}
