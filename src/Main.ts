import { Howler } from 'howler'
import { HowlerWrapper } from './audio/HowlerWrapper'
import { AudioType, createGameConfig, RendererType } from './create-game-config'
import { GameAnalyticsWrapper } from './GameAnalyticsWrapper'
import { LoadingOverlay } from './LoadingOverlay'
import { NotificationsManager } from './NotificationsManager'
import { ToastsManager } from './robowhale/phaser3/gameObjects/toast/ToastsManager'
import { Phaser3Extensions } from './robowhale/phaser3/Phaser3Extensions'
import { Polyfills } from './robowhale/Polyfills'
import { BitmapFontEditor } from './scenes/bitmapFontEditor/BitmapFontEditor'
import { Boot } from './scenes/Boot'
import { GlobalScene } from './scenes/global/GlobalScene'
import { Preloader } from './scenes/preloader/Preloader'
import { SceneKey } from './scenes/SceneKey'
import { SentryWrapper } from './SentryWrapper'
import { GameStash } from './stash/GameStash'
import { GameStore } from './store/GameStore'
import { GameTexts } from './texts/GameTexts'
import WebGLRenderer = Phaser.Renderer.WebGL.WebGLRenderer

export class Main extends Phaser.Game {
	public static development = true
	public rendererType: RendererType
	public audioType: AudioType
	public audio: HowlerWrapper
	public sentry: SentryWrapper
	public texts: GameTexts
	public store: GameStore
	public globalScene: GlobalScene
	public analytics: GameAnalyticsWrapper
	public toasts: ToastsManager

	constructor() {
		Polyfills.polyfill()
		Phaser3Extensions.extend()

		super(createGameConfig())

		this.webp = false
		this.avif = false
		this.audioType = this.getAudioType(Howler)
		this.rendererType = this.getRendererType()

		this.stash = new GameStash()
		this.loadingScreen = new LoadingOverlay(this)
		this.audio = new HowlerWrapper(this, { muteTrigger: 'hidden' })
		this.notifications = new NotificationsManager()
		this.addScenes()
	}

	private getAudioType(howler: Howler): AudioType {
		if (howler.noAudio) {
			return AudioType.NO_AUDIO
		}

		return howler.usingWebAudio ? AudioType.WEB_AUDIO : AudioType.HTML5_AUDIO
	}

	private getRendererType(): RendererType {
		if (this.renderer instanceof WebGLRenderer) {
			return RendererType.WEBGL
		}

		return RendererType.CANVAS
	}

	private addScenes() {
		this.scene.add(SceneKey.GLOBAL, GlobalScene)
		this.scene.add(SceneKey.BOOT, Boot, true)
		this.scene.add(SceneKey.PRELOADER, Preloader)
		this.scene.add(SceneKey.BITMAP_FONT_EDITOR, BitmapFontEditor)
	}

	public changeScene(currentSceneKey: SceneKey, newSceneKey: SceneKey, newSceneData?: object): void {
		this.globalScene.sceneTransition.changeScene(currentSceneKey, newSceneKey, newSceneData)
	}

	public restartScene(currentScene: SceneKey, data?: object): void {
		this.globalScene.sceneTransition.changeScene(currentScene, currentScene, data)
	}

	public injectIntoScenes(obj: any, key: string): void {
		this.scene.scenes.forEach((scene) => {
			if (key in scene) {
				console.warn(`Key ${key} is taken in ${scene.scene.key} scene!`)
				return
			}

			scene[key] = obj
		})
	}
}
