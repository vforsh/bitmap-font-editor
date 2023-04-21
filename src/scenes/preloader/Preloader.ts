import { cloneDeep } from 'lodash-es'
import { IStartProjectConfig } from '../../IStartProjectConfig'
import { BaseScene } from '../../robowhale/phaser3/scenes/BaseScene'
import { CanvasSceneTransition } from '../../sceneTransition/CanvasSceneTransition'
import { ISceneTransition } from '../../sceneTransition/ISceneTransition'
import { GameStore } from '../../store/GameStore'
import { SceneKey } from '../SceneKey'

export class Preloader extends BaseScene {
	public init(data?: any) {
		super.init(data)

		this.game.loadingScreen.showPreloader()
	}

	public preload() {
		this.loadSaveData()
		this.loadStartProjectConfig()
	}

	private loadSaveData() {
		this.load.rexAwait('init_game_store', {
			callback: (onSuccess) => {
				this.game.store = new GameStore(this.game, `bmfont-editor`)
				this.game.store
					.initActualStorage()
					.catch((error) => {
						this.game.analytics.sendError(`Storage:Not_Available`)
					})
					.finally(async () => {
						await this.game.store.loadInitialValues()
						onSuccess()
					})
			},
		})
	}

	private loadStartProjectConfig() {
		this.load.json('start_project', 'assets/start_project.json')
	}

	public create() {
		this.initStore()
		this.initStartProjectConfig()
		this.addScenesTransition()
		this.addToasts()

		this.startScene(SceneKey.BITMAP_FONT_EDITOR)
	}

	private initStore() {
		this.game.store.changeNumber('login_num', 1)
	}

	private initStartProjectConfig() {
		let config: IStartProjectConfig = this.cache.json.get('start_project')
		if (config) {
			this.game.stash.set('startProject', cloneDeep(config))
		}
	}

	private addScenesTransition() {
		let transition: ISceneTransition = new CanvasSceneTransition(this.game.globalScene, '__BLACK')
		this.game.globalScene.addSceneTranstion(transition)
		this.game.globalScene.sceneTransition.instantChange = true

		this.game.sentry.trackSceneChanges(transition)
	}

	private addToasts() {
		this.game.toasts = this.game.globalScene.addToasts()
	}

	private startScene(scene: SceneKey | string, data?: any): void {
		this.game.changeScene(this.scene.key, scene, data)
	}

	public resize(): void {
		super.resize()
	}

	public onShutdown() {
		super.onShutdown()

		// this.game.loadingScreen.fadeOut()
	}
}
