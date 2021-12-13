declare module Phaser {
	
	namespace Renderer {
		namespace WebGL {
			interface WebGLRenderer {
				textureFlush: number
				maxTextures: number
			}
		}
	}
	
	namespace Sound {
		
		interface BaseSoundManager {
			sounds: BaseSound[]
		}
		
		interface WebAudioSoundManager {
			context: AudioContext
		}
		
		interface WebAudioSound {
			muteNode: GainNode
			volumeNode: GainNode
		}
	}
	
	namespace Animations {
		interface AnimationManager {
			getFrameNames(atlasKey: string, prefix: string): Phaser.Types.Animations.AnimationFrame[]
		}
	}
	
	namespace Physics {
		namespace Matter {
			
			import MatterCollisionPair = Phaser.Types.Physics.Matter.MatterCollisionPair
			
			namespace Matter {
				
				import MatterBodyConfig = Phaser.Types.Physics.Matter.MatterBodyConfig
				
				export var uses: any[]
				
				class Body extends MatterJS.Body {
				}
				
				class Sleeping {
					static set(body: MatterJS.BodyType, isSleeping: boolean)
				}
				
				class Bodies {
					static circle(x: number, y: number, radius: number, options: MatterBodyConfig, maxSides?: number): MatterJS.BodyType
					
					static fromVertices(x: number, y: number, vertexSets: any, options: MatterBodyConfig, flagInternal?, removeCollinear?, minimumArea?): MatterJS.BodyType
				}
				
				class Events {
					static on(item: any, eventName: string, callback: Function)
					
					static off(item: any, eventName: string)
				}
				
				class Plugin {
					static register(pluginClass: any)
					
					static use(lib, plugin)
				}
				
				class Resolver {
					static _restingThresh: number
					static _restingThreshTangent: number
					static _positionDampen: number
					static _positionWarming: number
					static _frictionNormalMultiplier: number
				}
			}
			
			interface IgnoreCollision {
				ignoreCollisionCategory(value: number): Phaser.GameObjects.GameObject
			}
			
			interface Image extends IgnoreCollision {
			}
			
			interface Sprite extends IgnoreCollision {
			}
			
			interface World {
				getContactPoint(pair: MatterCollisionPair, out?: Phaser.Types.Math.Vector2Like): Phaser.Types.Math.Vector2Like
			}
			
			interface MatterWorldEventPayload {
				object?: MatterJS.BodyType
				name: string
				source: any
			}
		}
	}
	
	namespace Math {
		function Sign(value: Number): number
		
		function Map(value: number, a1: number, a2: number, b1: number, b2: number, ease: (n?: number) => number): number
		
		function MapLinear(value: number, a1: number, a2: number, b1: number, b2: number): number
		
		function MapLinearClamp(value: number, a1: number, a2: number, b1: number, b2: number): number
		
		interface RandomDataGenerator {
			bool(): boolean
			pickMultiple<T>(array: T[], num: number): T[]
			pickExcept<T>(array: T[], exception: T, safetyCounter?: number): T
			pickExceptMultiple<T>(array: T[], exceptions: T[], safetyCounter?: number): T
		}
	}
	
	namespace GameObjects {
		
		namespace Particles {
			interface ParticleEmitter extends IKillable {
			}
			
			interface ParticleEmitterManager extends IKillable {
			}
		}
		
		interface Group {
			createItems(quantity: number)
		}
		
		interface GameObjectCreator {
			graphics(config?: object, addToScene?: boolean): Phaser.GameObjects.Graphics
			image(config: Phaser.Types.GameObjects.GameObjectConfig & { key: string; frame: string }, addToScene?: boolean): Phaser.GameObjects.Image
			text(config: Phaser.Types.GameObjects.GameObjectConfig & { text?: string; style?: Phaser.Types.GameObjects.Text.TextStyle }, addToScene?: boolean): Phaser.GameObjects.Text
		}
		
		type AutoSizeText = import("../robowhale/phaser3/gameObjects/text/AutoSizeText").AutoSizeText
		type AutoSizeTextOptions = import("../robowhale/phaser3/gameObjects/text/AutoSizeText").AutoSizeTextOptions
		type SimpleButton = import("../robowhale/phaser3/gameObjects/buttons/SimpleButton").SimpleButton
		type ToggleButton = import("../robowhale/phaser3/gameObjects/buttons/ToggleButton").ToggleButton
		type SoundButton = import("../robowhale/phaser3/gameObjects/buttons/SoundButton").SoundButton
		type MusicButton = import("../robowhale/phaser3/gameObjects/buttons/MusicButton").MusicButton
		type ComplexButton = import("../robowhale/phaser3/gameObjects/buttons/ComplexButton").ComplexButton
		
		interface GameObjectFactory {
			existingMultiple<GO extends Phaser.GameObjects.GameObject>(children: GO[]): GO[]
			autoSizeText(text: string | string[], style?: Phaser.Types.GameObjects.Text.TextStyle, options?: AutoSizeTextOptions, parent?: Container): AutoSizeText
			button(texture: string, frame?: string, parent?: Container): SimpleButton
			toggleButton(texture: string, frame_1: string, frame_2: string, parent?: Container): ToggleButton
			soundButton(texture: string, frame_1: string, frame_2: string, parent?: Container): SoundButton
			musicButton(texture: string, frame_1: string, frame_2: string, parent?: Container): MusicButton
			complexButton(backTexture: string, backFrame?: string, parent?: Container): ComplexButton
		}
		
		interface Container extends IKillable, IDisplayObject {
			gridAlign(options: Phaser.Types.Actions.GridAlignConfig, startIndex?: integer, endIndex?: integer): Phaser.GameObjects.Container
		}
		
		interface Sprite extends IKillable, IDisplayObject {
		}
		
		interface Image extends IKillable, IDisplayObject {
		}
		
		interface Graphics extends IKillable, IDisplayObject {
			inverseSlice(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean, overshoot?: number): this;
		}
		
		interface Shape extends IKillable, IDisplayObject {
		}
		
		interface Text extends IKillable, IDisplayObject {
		}
		
		interface BitmapText extends IKillable, IDisplayObject {
		}
		
		interface RenderTexture extends IKillable {
		}
		
		interface IDisplayObject {
			getWorldPosition(out?: Phaser.Types.Math.Vector2Like): Phaser.Types.Math.Vector2Like
			getGlobalCenter(): Phaser.Types.Math.Vector2Like
		}
		
		interface Scalable {
			fitWidth(width: number): void
			fitHeight(height: number): void
			fitIn(width: number, height: number): void
			fillWidth(width: number): void
			fillHeight(height: number): void
			envelop(width: number, height: number): void
		}
		
		interface Alignable {
			top: number
			right: number
			bottom: number
			left: number
		}
		
		interface IKillable {
			kill()
			revive()
		}
		
		interface GameObject extends Scalable, Alignable {
			scene: Phaser.Scene
		}
		
		namespace Components {
			
			interface GetBounds {
				// prepareBoundsOutput(output: Vector2Like, includeParent: boolean): Vector2Like
			}
		}
	}
	
	namespace Loader {
		interface LoaderPlugin {
			cacheBuster: string
			bitmapFontJson(key: string, textureURL: string | string[], fontDataURL: string, addToTexture?: string): Phaser.Loader.LoaderPlugin
			bitmapFontFromAtlas(key: string, atlasKey: string, atlasFrame: string, dataURL: string, xSpacing?: number, ySpacing?: number): Phaser.Loader.LoaderPlugin
			scriptTag(key: string, url: string, onSuccess?: Function, onFail?: Function): Phaser.Loader.LoaderPlugin
		}
	}
	
	// Phaser.Cameras.Scene2D.Camera
	namespace Cameras {
		namespace Scene2D {
			interface Camera {
				_bounds: Phaser.Geom.Rectangle
			}
		}
	}
	
	namespace Tweens {
		
		interface CircleTweenConfig extends Phaser.Types.Tweens.NumberTweenBuilderConfig {
			centerX: number
			centerY: number
			radius: number
			target: { x: number, y: number }
			startAngle?: number
			endAngle?: number
		}
		
		interface CurveLike {
			getTangent<O extends Phaser.Math.Vector2>(t: number, out?: O): O;
			getPoint<O extends Phaser.Math.Vector2>(t: number, out?: O): O;
		}
		
		interface CurveTweenConfig extends Phaser.Types.Tweens.NumberTweenBuilderConfig {
			curve: CurveLike
			target: { x: number, y: number, angle: number }
			rotateToCurve?: boolean
			rotateOffset?: number
			[k: string]: any
		}
		
		interface ShakeTweenConfig extends Omit<Phaser.Types.Tweens.TweenBuilderConfig, "targets"> {
			target: object
			property: string
			base?: number
			delta: number
			repeat: number
		}
		
		interface TweenManager {
			_active: Phaser.Tweens.Tween[]
			_pending: Phaser.Tweens.Tween[]
			
			stagger(value: number | number[], config?: Phaser.Types.Tweens.StaggerConfig): Function;
			killTweensByProperty(item: any, ...properties: string[]): this
			addYoyoTween(config: ShakeTweenConfig): Phaser.Tweens.Tween
			addCircleTween(config: CircleTweenConfig): Phaser.Tweens.Tween
			addCurveTween(config: CurveTweenConfig): Phaser.Tweens.Tween
		}
	}
	
}
