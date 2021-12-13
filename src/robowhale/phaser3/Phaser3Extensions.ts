import { SimpleButton } from "./gameObjects/buttons/SimpleButton"
import { ToggleButton } from "./gameObjects/buttons/ToggleButton"
import { SoundButton } from "./gameObjects/buttons/SoundButton"
import { callAllMethods } from "../Polyfills"
import { AutoSizeText } from "./gameObjects/text/AutoSizeText"
import { ComplexButton } from "./gameObjects/buttons/ComplexButton"
import { MusicButton } from "./gameObjects/buttons/MusicButton"
import { parseJsonBitmapFont } from "./gameObjects/bitmap-text/parse-json-bitmap-font"

type CircleTweenConfig = Phaser.Tweens.CircleTweenConfig
type CurveTweenConfig = Phaser.Tweens.CurveTweenConfig
type ShakeTweenConfig = Phaser.Tweens.ShakeTweenConfig

export class Phaser3Extensions {
	
	public static extend(): void {
		callAllMethods(Phaser3Extensions, ["extend"])
	}
	
	public static extendGroup(): void {
		Phaser.GameObjects.Group.prototype.createItems = function(quantity: number): any[] {
			let items = []
			
			for (let i: number = 0; i < quantity; i++) {
				items.push(this.create())
			}
			
			return items
		}
	}
	
	public static extendGraphics(): void {
		Phaser.GameObjects.Graphics.prototype.inverseSlice = function(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean, overshoot?: number) {
			let inverseStartAngle = endAngle
			let inverseEndAngle = startAngle
			
			return this.slice(x, y, radius, inverseStartAngle, inverseEndAngle, anticlockwise, overshoot)
		}
	}
	
	public static extendTweens(): void {
		Phaser.Tweens.TweenManager.prototype.addYoyoTween = function(config: ShakeTweenConfig): Phaser.Tweens.Tween {
			let baseValue = config.base ?? config.target[config.property]
			let repeatCounter = 0
			let { target, property, base, delta, ...tweenProps } = config
			
			return this.add({
				ease: Phaser.Math.Easing.Sine.Out,
				...tweenProps,
				targets: config.target,
				yoyo: true,
				[config.property]: (target, key) => {
					if (++repeatCounter % 2 === 0) {
						return baseValue - config.delta
					} else {
						return baseValue + config.delta
					}
				},
			})
		}
		
		Phaser.Tweens.TweenManager.prototype.addCircleTween = function(config: CircleTweenConfig): Phaser.Tweens.Tween {
			config.startAngle ??= -90
			config.endAngle ??= config.startAngle + 360
			
			return this.addCounter({
				...config,
				onUpdate: (tween, target, param) => {
					let angle = config.startAngle + (config.endAngle - config.startAngle) * target.value
					let angleRad = Phaser.Math.DegToRad(angle)
					config.target.x = config.centerX + Math.cos(angleRad) * config.radius
					config.target.y = config.centerY + Math.sin(angleRad) * config.radius
					
					if (config.onUpdate) {
						config.onUpdate(tween, target, param)
					}
				},
			} as Phaser.Types.Tweens.NumberTweenBuilderConfig)
		}
		
		Phaser.Tweens.TweenManager.prototype.addCurveTween = function(config: CurveTweenConfig): Phaser.Tweens.Tween {
			let position = new Phaser.Math.Vector2()
			let tangent: Phaser.Math.Vector2
			if (config.rotateToCurve) {
				tangent = new Phaser.Math.Vector2()
				config.rotateOffset ??= 0
			}
			
			return this.addCounter({
				...config,
				onUpdate: (tween, target, param) => {
					config.curve.getPoint(target.value, position)
					config.target.x = position.x
					config.target.y = position.y
					
					if (config.rotateToCurve) {
						config.curve.getTangent(target.value, tangent)
						config.target.angle = tangent.angle() * Phaser.Math.RAD_TO_DEG + config.rotateOffset
					}
					
					if (config.onUpdate) {
						config.onUpdate(tween, target, param)
					}
				},
			} as Phaser.Types.Tweens.NumberTweenBuilderConfig)
		}
		
		let killTweensByProperty = (tweens: Phaser.Tweens.Tween[], target: any, properties: string[]) => {
			tweens.forEach((tween) => {
				if (!tween.hasTarget(target)) {
					return
				}
				
				let hasProperties = tween.data.some(data => properties.includes(data.key))
				if (hasProperties) {
					tween.stop()
				}
			})
		}
		
		Phaser.Tweens.TweenManager.prototype.killTweensByProperty = function(target: any, ...properties: string[]) {
			killTweensByProperty(this._active, target, properties)
			killTweensByProperty(this._pending, target, properties)
			
			return this
		}
	}
	
	public static addGetGlobalPosition(): void {
		let getWorldPosition = function(out?: Phaser.Types.Math.Vector2Like): Phaser.Types.Math.Vector2Like {
			let worldMatrix = this.getWorldTransformMatrix()
			out = out ?? { x: 0, y: 0 }
			out.x = worldMatrix.tx
			out.y = worldMatrix.ty
			
			return out
		}
		
		let getGlobalCenter = function(): Phaser.Types.Math.Vector2Like {
			let center = this.getCenter()
			return this.prepareBoundsOutput(center, true)
		}
		
		// noinspection JSUnusedLocalSymbols
		let classes = [
			Phaser.GameObjects.Container,
			Phaser.GameObjects.Image,
			Phaser.GameObjects.Sprite,
			Phaser.GameObjects.Graphics,
			Phaser.GameObjects.Shape,
			Phaser.GameObjects.Text,
			Phaser.GameObjects.BitmapText,
		].forEach((clazz) => {
			clazz.prototype.getWorldPosition = getWorldPosition
			
			if (clazz.prototype.hasOwnProperty("getCenter") && clazz.prototype.hasOwnProperty("prepareBoundsOutput")) {
				clazz.prototype.getGlobalCenter = getGlobalCenter
			}
		})
	}
	
	public static addKillRevive(): void {
		let kill = function() {
			this.visible = false
			this.active = false
		}
		
		let revive = function() {
			this.visible = true
			this.active = true
		}
		
		// noinspection JSUnusedLocalSymbols
		let classes = [
			Phaser.GameObjects.RenderTexture,
			Phaser.GameObjects.Container,
			Phaser.GameObjects.Image,
			Phaser.GameObjects.Sprite,
			Phaser.GameObjects.Graphics,
			Phaser.GameObjects.Shape,
			Phaser.GameObjects.Text,
			Phaser.GameObjects.BitmapText,
			Phaser.GameObjects.Particles.ParticleEmitter,
			Phaser.GameObjects.Particles.ParticleEmitterManager,
		].forEach((clazz) => {
			clazz.prototype.kill = kill
			clazz.prototype.revive = revive
		})
	}
	
	public static extendContainer(): void {
		Phaser.GameObjects.Container.prototype.gridAlign = function(options, startIndex, endIndex) {
			if (typeof startIndex === "undefined") {
				startIndex = 0
			}
			
			if (typeof endIndex === "undefined") {
				endIndex = this.length
			}
			
			let items = this.list.slice(startIndex, endIndex)
			Phaser.Actions.GridAlign(items, options)
			
			return this
		}
	}
	
	public static extendAnimationManager(): void {
		if (typeof Phaser.Animations === "undefined") {
			return
		}
		
		let sortByFrameNumbers = (frame_1: string, frame_2: string): number => {
			let index_1 = getFrameNumber(frame_1)
			let index_2 = getFrameNumber(frame_2)
			return index_1 - index_2
		}
		
		let getFrameNumber = (frameName: string, zeroPad: number = 4): number => {
			return parseInt(frameName.slice(-zeroPad))
		}
		
		Phaser.Animations.AnimationManager.prototype.getFrameNames = function(atlasKey, prefix) {
			let allFrames: string[] = this.game.textures.get(atlasKey).getFrameNames()
			let animationFrameNames: string[] = allFrames.filter((frameName) => frameName.includes(prefix)).sort(sortByFrameNumbers)
			
			return animationFrameNames.map((frameName) => {
				return {
					key: atlasKey,
					frame: frameName,
				}
			})
		}
	}
	
	public static extendMath(): void {
		Phaser.Math.Sign = (value: number) => {
			return value >= 0 ? 1 : -1
		}
		
		Phaser.Math.Map = function(x, a1, a2, b1, b2, ease) {
			return b1 + ease(x / (a2 - a1)) * (b2 - b1)
		}
		
		Phaser.Math.MapLinear = function(x, a1, a2, b1, b2) {
			return b1 + ((x - a1) * (b2 - b1)) / (a2 - a1)
		}
		
		Phaser.Math.MapLinearClamp = function(x, a1, a2, b1, b2) {
			let value = Phaser.Math.MapLinear(x, a1, a2, b1, b2)
			
			let max: number
			let min: number
			if (b1 > b2) {
				max = b1
				min = b2
			} else {
				max = b2
				min = b1
			}
			
			return Phaser.Math.Clamp(value, min, max)
		}
	}
	
	public static extendRandomDataGenerator(): void {
		Phaser.Math.RandomDataGenerator.prototype.bool = function(): boolean {
			return this.frac() > 0.5
		}
		
		Phaser.Math.RandomDataGenerator.prototype.pickMultiple = function <T>(array: T[], num: number): T[] {
			num = Math.min(num, array.length)
			
			let result = []
			
			while (result.length < num) {
				let item = this.pick(array)
				if (result.includes(item) === false) {
					result.push(item)
				}
			}
			
			return result
		}
		
		Phaser.Math.RandomDataGenerator.prototype.pickExcept = function <T>(array: T[], exception: T): T {
			let item: T
			let safetyCounter: number = array.length
			
			do {
				item = this.pick(array)
			} while (exception === item && --safetyCounter > 0)
			
			return item
		}
		
		Phaser.Math.RandomDataGenerator.prototype.pickExceptMultiple = function <T>(array: T[], exceptions: T[], safetyCounter: number = 100): T {
			let item: T
			
			do {
				item = this.pick(array)
			} while (exceptions.includes(item) && --safetyCounter > 0)
			
			return item
		}
	}
	
	public static extendFactory(): void {
		let factory: Phaser.GameObjects.GameObjectFactory = Phaser.GameObjects.GameObjectFactory.prototype
		
		factory.existingMultiple = function(children: any[]): any[] {
			return children.map((child) => this.existing(child))
		}
		
		factory.button = function(texture: string, frame?: string, parent?: Phaser.GameObjects.Container) {
			return new SimpleButton(this.scene, texture, frame, parent)
		}
		
		factory.toggleButton = function(texture: string, frame_1: string, frame_2: string, parent?: Phaser.GameObjects.Container) {
			return new ToggleButton(this.scene, texture, frame_1, frame_2, parent)
		}
		
		factory.soundButton = function(texture: string, frame_1: string, frame_2: string, parent?: Phaser.GameObjects.Container) {
			return new SoundButton(this.scene, texture, frame_1, frame_2, parent)
		}
		
		factory.musicButton = function(texture: string, frame_1: string, frame_2: string, parent?: Phaser.GameObjects.Container) {
			return new MusicButton(this.scene, texture, frame_1, frame_2, parent)
		}
		
		factory.complexButton = function(backTexture, backFrame, parent) {
			return new ComplexButton(this.scene, backTexture, backFrame, parent)
		}
		
		factory.autoSizeText = function(content, style?, options?, parent?: Phaser.GameObjects.Container): AutoSizeText {
			let text = new AutoSizeText(this.scene, 0, 0, content, style, options)
			
			parent
				? parent.add(text)
				: this.scene.add.existing(text)
			
			return text
		}
	}
	
	private static addScaleMethods(): void {
		let hasScale = (object) => {
			return typeof object.setScale !== "undefined"
		}
		
		Phaser.GameObjects.GameObject.prototype.fitWidth = function(width: number): void {
			if (hasScale(this) === false) {
				return
			}
			
			this.setScale(1)
			this.setScale(width / this.width)
		}
		
		Phaser.GameObjects.GameObject.prototype.fitHeight = function(maxHeight: number) {
			if (hasScale(this) === false) {
				return
			}
			
			this.setScale(Math.min(1, maxHeight / this.height))
		}
		
		Phaser.GameObjects.GameObject.prototype.fitIn = function(maxWidth: number, maxHeight: number) {
			if (hasScale(this) === false) {
				return
			}
			
			let scaleX: number = maxWidth / this.width
			let scaleY: number = maxHeight / this.height
			this.scale = Math.min(1, scaleX, scaleY)
		}
		
		Phaser.GameObjects.GameObject.prototype.fillWidth = function(maxWidth: number): void {
			if (hasScale(this) === false) {
				return
			}
			
			this.setScale(Math.max(1, maxWidth / this.width))
		}
		
		Phaser.GameObjects.GameObject.prototype.fillHeight = function(maxHeight: number) {
			if (hasScale(this) === false) {
				return
			}
			
			this.setScale(Math.max(1, maxHeight / this.height))
		}
		
		Phaser.GameObjects.GameObject.prototype.envelop = function(maxWidth: number, maxHeight: number) {
			if (hasScale(this) === false) {
				return
			}
			
			let scaleX: number = maxWidth / this.width
			let scaleY: number = maxHeight / this.height
			this.scale = Math.max(scaleX, scaleY)
		}
	}
	
	private static addAlighMethods(): void {
		Object.defineProperty(Phaser.GameObjects.GameObject.prototype, "top", {
			get: function() {
				return Phaser.Display.Bounds.GetTop(this)
			},
			set: function(value: number) {
				return Phaser.Display.Bounds.SetTop(this, value)
			},
		})
		
		Object.defineProperty(Phaser.GameObjects.GameObject.prototype, "right", {
			get: function() {
				return Phaser.Display.Bounds.GetRight(this)
			},
			set: function(value: number) {
				return Phaser.Display.Bounds.SetRight(this, value)
			},
		})
		
		Object.defineProperty(Phaser.GameObjects.GameObject.prototype, "bottom", {
			get: function() {
				return Phaser.Display.Bounds.GetBottom(this)
			},
			set: function(value: number) {
				return Phaser.Display.Bounds.SetBottom(this, value)
			},
		})
		
		Object.defineProperty(Phaser.GameObjects.GameObject.prototype, "left", {
			get: function() {
				return Phaser.Display.Bounds.GetLeft(this)
			},
			set: function(value: number) {
				return Phaser.Display.Bounds.SetLeft(this, value)
			},
		})
	}
	
	private static extendLoader() {
		// TODO add support for <script> attributes (async, defer and others - https://developer.mozilla.org/ru/docs/Web/HTML/Element/script)
		Phaser.Loader.LoaderPlugin.prototype.scriptTag = function(key, url, onSuccess, onFail) {
			return this.rexAwait(key, {
				callback: (_onSuccess, _onFail) => {
					let script = document.createElement("script")
					script.setAttribute("src", url)
					script.setAttribute("type", "text/javascript")
					
					script.onload = event => {
						onSuccess?.(event)
						_onSuccess()
					}
					
					script.onerror = event => {
						onFail?.(event)
						_onFail()
					}
					
					// loading doesn't start until we append the script
					document.head.appendChild(script)
				},
			})
		}
		
		Phaser.Loader.LoaderPlugin.prototype.bitmapFontJson = function(
			key: string,
			textureURL: string | string[],
			fontDataURL: string,
			addToTexture?: string,
		): Phaser.Loader.LoaderPlugin {
			this.image(key, textureURL)
			this.json(key, fontDataURL)
			
			this.once(Phaser.Loader.Events.COMPLETE, () => {
				let json = this.cacheManager.json.get(key)
				let frame = this.textureManager.getFrame(key)
				let texture = addToTexture ? this.textureManager.get(addToTexture) : null
				let data = parseJsonBitmapFont(json, frame, texture)
				this.cacheManager.bitmapFont.add(key, { data, texture: key, frame: null })
			})
			
			return this
		}
		
		Phaser.Loader.LoaderPlugin.prototype.bitmapFontFromAtlas = function(
			fontKey: string,
			atlasKey: string,
			atlasFrame: string,
			dataURL: string,
			xSpacing?: number,
			ySpacing?: number,
		): Phaser.Loader.LoaderPlugin {
			let xmlKey: string = fontKey + "_data"
			this.xml(xmlKey, dataURL)
			
			this.once(Phaser.Loader.Events.COMPLETE, () => {
				let wasParsed: boolean = Phaser.GameObjects.BitmapText.ParseFromAtlas(this.scene, fontKey, atlasKey, atlasFrame, xmlKey, xSpacing, ySpacing)
				if (wasParsed === false) {
					console.warn(`Can't add bitmap font ${fontKey}`)
				}
			})
			
			return this
		}
	}
}
