import Vector2Like = Phaser.Types.Math.Vector2Like
import { ScrollableDebug } from './ScrollableDebug'

export interface ScrollableHitArea {
	width: number
	height: number
	x?: number
	y?: number
}

export interface ScrollableOptions {
	scrollDirection: 'horizontal' | 'vertical'
	scrollMin: number
	scrollMax: number
	scrollMultiplier?: number
	hitArea: ScrollableHitArea
	overscroll: {
		maxDistance: number
		deceleration: number
	}
	autoScroll: {
		maxDuration: number
		minSpeed: number
		damping: number
	}
	wheel?: {
		flickSpeed: number
		maxSpeed: number
	}
}

export class Scrollable<T extends Phaser.GameObjects.GameObject> extends Phaser.GameObjects.Container {
	public readonly options: ScrollableOptions
	protected readonly propertyKey: 'x' | 'y'
	public content: T
	public debug: ScrollableDebug<T>

	protected snapTween: Phaser.Tweens.Tween
	protected isPointerDown: boolean = false
	protected pointerMoveTs: number
	protected pointerMovePos: Vector2Like
	protected autoScroll: boolean = false
	protected autoScrollTimer: number
	protected autoScrollSpeed: number

	constructor(scene: Phaser.Scene, options: ScrollableOptions) {
		super(scene)

		this.options = options
		this.propertyKey = this.options.scrollDirection === 'horizontal' ? 'x' : 'y'

		this.doSetInteractive()

		this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.onPointerDown, this)
		this.scene.input.on(Phaser.Input.Events.GAMEOBJECT_POINTER_MOVE, this.onPointerMove, this)
		this.scene.input.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, this.onPointerUp, this)
		this.scene.input.on(Phaser.Input.Events.GAME_OUT, this.onPointerUp, this)

		if (this.options.wheel) {
			this.addPointerWheelListener()
		}

		this.debug = new ScrollableDebug(this)

		this.scene.sys.updateList.add(this)
	}

	private doSetInteractive(): void {
		let { x, y, width, height } = this.options.hitArea

		let dx = x ?? 0
		let dy = y ?? 0
		this.setInteractive(new Phaser.Geom.Rectangle(-width / 2 + dx, -height / 2 + dy, width, height), Phaser.Geom.Rectangle.Contains)
	}

	private addPointerWheelListener() {
		let isMacOs = this.scene.game.device.os.macOS
		let callback = isMacOs ? this.onPointerWheelMacOs.bind(this) : this.onPointerWheel.bind(this)

		this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_WHEEL, callback)
	}

	protected onPointerDown(pointer: Phaser.Input.Pointer): void {
		if (this.isPointerDown) {
			return
		}

		this.isPointerDown = true

		this.pointerMoveTs = pointer.downTime
		this.pointerMovePos = { x: pointer.x, y: pointer.y }

		this.autoScrollSpeed = 0
		this.autoScroll = false

		this.snapTween?.remove()
		this.snapTween = null
	}

	protected onPointerMove(pointer: Phaser.Input.Pointer, x: number, y: number): void {
		if (this.isPointerDown === false) {
			return
		}

		let now = pointer.moveTime
		let elapsed = now - this.pointerMoveTs

		let prop = this.propertyKey
		let delta = pointer[prop] - this.pointerMovePos[prop]
		this.autoScrollSpeed = 0.8 * ((30 * delta) / (1 + elapsed)) + 0.2 * this.autoScrollSpeed

		this.content[prop] = this.getContentPositionWhileDragging(pointer)
		this.pointerMoveTs = now
		this.pointerMovePos[prop] = pointer[prop]
	}

	private getContentPositionWhileDragging(pointer: Phaser.Input.Pointer): number {
		let prop = this.propertyKey
		let distance = pointer[prop] - this.pointerMovePos[prop]
		let { scrollMin, scrollMax } = this.options

		let isMovingForward = distance > 0
		let isMovingBackward = distance < 0

		let k = this.options.scrollMultiplier ?? 1
		let maxOverscroll = this.options.overscroll.maxDistance

		let newPos = this.content[prop] + distance
		if (newPos > scrollMax && isMovingForward) {
			k = Phaser.Math.MapLinear(newPos, scrollMax, scrollMax + maxOverscroll, k, 0)
		} else if (newPos < scrollMin && isMovingBackward) {
			k = Phaser.Math.MapLinear(newPos, scrollMin, scrollMin - maxOverscroll, k, 0)
		}

		return this.content[prop] + distance * k
	}

	protected onPointerUp(pointer: Phaser.Input.Pointer): void {
		if (this.isPointerDown === false) {
			return
		}

		this.isPointerDown = false

		let prop = this.propertyKey
		let pos = this.content[prop]
		let { scrollMin, scrollMax } = this.options

		let isOverscroll = pos > scrollMax || pos < scrollMin
		if (isOverscroll) {
			this.snapContent()
			return
		}

		this.autoScroll = true
		this.autoScrollTimer = 0
	}

	private onPointerWheelMacOs(pointer: Phaser.Input.Pointer, dx: number, dy: number) {
		if (pointer.isDown) {
			return
		}

		this.snapTween?.remove()
		this.snapTween = null

		this.autoScroll = false
		this.autoScrollTimer = 0

		let prop = this.propertyKey
		let pos = this.content[prop]
		let delta = this.options.scrollDirection === 'horizontal' ? dx : dy
		this.content[prop] = Phaser.Math.Clamp(pos - delta, this.options.scrollMin, this.options.scrollMax)
	}

	private onPointerWheel(pointer: Phaser.Input.Pointer, dx: number, dy: number) {
		if (pointer.isDown) {
			return
		}

		this.snapTween?.remove()
		this.snapTween = null

		let delta = this.options.scrollDirection === 'horizontal' ? dx : dy
		let scrollDirection = Phaser.Math.Sign(delta) * -1
		if (scrollDirection !== Phaser.Math.Sign(this.autoScrollSpeed)) {
			this.autoScrollSpeed = 0
		}

		if (this.autoScroll === false) {
			this.autoScrollSpeed = 0
		}

		let increment = this.options.wheel.flickSpeed
		let newSpeed = this.autoScrollSpeed + increment * scrollDirection
		let maxSpeed = this.options.wheel.maxSpeed

		this.autoScroll = true
		this.autoScrollTimer = 0
		this.autoScrollSpeed = Phaser.Math.Clamp(newSpeed, -maxSpeed, maxSpeed)
	}

	public preUpdate(time: number, delta: number): void {
		if (this.autoScroll) {
			this.updateAutoScroll(delta)
		}
	}

	private updateAutoScroll(delta: number) {
		this.autoScrollTimer += Math.min(100, delta)

		let prop = this.propertyKey
		let pos = this.content[prop]
		let { scrollMin, scrollMax } = this.options

		let dampingK = 1

		let isOverscroll = pos > scrollMax || pos < scrollMin
		if (isOverscroll) {
			let position = pos
			let overscrollAmount = position > scrollMax ? position - scrollMax : scrollMin - position
			dampingK = Phaser.Math.MapLinear(overscrollAmount, 0, this.options.overscroll.maxDistance, 1, this.options.autoScroll.damping)
		}

		let velocity = Phaser.Math.MapLinearClamp(this.autoScrollTimer * dampingK, 0, this.options.autoScroll.maxDuration, this.autoScrollSpeed, 0)

		let shouldStop = Math.abs(velocity) < this.options.autoScroll.minSpeed
		if (shouldStop) {
			this.autoScroll = false
			this.snapContent()
			return
		}

		this.content[prop] = pos + velocity
	}

	private snapContent() {
		let prop = this.propertyKey
		let pos = this.content[prop]
		let { scrollMin, scrollMax } = this.options

		let overscroll = pos > scrollMax || pos < scrollMin
		if (!overscroll) {
			return
		}

		let targetPos = Phaser.Math.Clamp(pos, scrollMin, scrollMax)
		let distance = Math.abs(pos - targetPos)
		let duration = Math.max(300, distance)

		this.snapTween = this.scene.tweens.add({
			targets: this.content,
			duration: duration,
			ease: Phaser.Math.Easing.Quadratic.Out,
			[prop]: targetPos,
			onComplete: () => {
				this.snapTween = null
			},
		})
	}

	public snapContentInstant(): void {
		let prop = this.propertyKey
		let pos = this.content[prop]
		this.content[prop] = Phaser.Math.Clamp(pos, this.options.scrollMin, this.options.scrollMax)
	}

	public enableInput(): void {
		if (this.input.enabled) {
			return
		}

		this.setInteractive()
		this.scene.input.on(Phaser.Input.Events.GAMEOBJECT_POINTER_MOVE, this.onPointerMove, this)
		this.scene.input.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, this.onPointerUp, this)
		this.scene.input.on(Phaser.Input.Events.GAME_OUT, this.onPointerUp, this)
	}

	public disableInput(): void {
		if (!this.input.enabled) {
			return
		}

		this.disableInteractive()
		this.scene.input.off(Phaser.Input.Events.GAMEOBJECT_POINTER_MOVE, this.onPointerMove, this)
		this.scene.input.off(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, this.onPointerUp, this)
		this.scene.input.off(Phaser.Input.Events.GAME_OUT, this.onPointerUp, this)
	}

	protected preDestroy() {
		super.preDestroy()

		this.scene.input.off(Phaser.Input.Events.GAMEOBJECT_POINTER_MOVE, this.onPointerMove, this)
		this.scene.input.off(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, this.onPointerUp, this)
		this.scene.input.off(Phaser.Input.Events.GAME_OUT, this.onPointerUp, this)

		this.scene.sys.updateList.remove(this)
	}
}
