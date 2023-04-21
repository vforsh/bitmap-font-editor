import Animation = Phaser.Animations.Animation

export interface IPooledAnimation extends Animation {
	active?: boolean
}

export interface AnimationsPoolOptions {
	name: string
	prefix: string
	atlas: string
	initialNum: number
	animationConfig: Phaser.Types.Animations.Animation
}

export class AnimationsPool {
	private readonly scene: Phaser.Scene
	private readonly options: AnimationsPoolOptions
	private pool: IPooledAnimation[]
	private counter: number = 0

	constructor(scene: Phaser.Scene, options: AnimationsPoolOptions) {
		this.scene = scene
		this.options = options

		this.pool = this.createAnimations(this.options.initialNum)
	}

	private createAnimations(num: number) {
		let filterBooleans = (value) => {
			return typeof value !== 'boolean'
		}

		return Array(num)
			.fill(0)
			.map(() => this.createAnimation())
			.filter(filterBooleans)
			.map((animation: IPooledAnimation) => {
				animation.active = false
				return animation
			})
	}

	private createAnimation() {
		this.counter++

		return this.scene.anims.create({
			...this.options.animationConfig,
			key: this.options.prefix + '_' + this.counter.toString(),
			frames: this.scene.anims.getFrameNames(this.options.atlas, this.options.prefix),
		})
	}

	public getInactive(): IPooledAnimation {
		let anim = this.pool.find((item) => item.active === false)
		if (!anim) {
			anim = this.createAnimation() as any
			this.pool.push(anim)

			console.warn(`Enlarge ${this.options.name} animations pool! New size is ${this.pool.length}.`)
		}

		anim.active = true

		return anim
	}

	public recycleActive(anim: IPooledAnimation): void {
		anim.active = false
	}

	public recycleAll(): void {
		this.pool.forEach((anim) => (anim.active = false))
	}

	public getState(): string {
		let activeNum: number = this.pool.filter((item) => item.active).length
		let inactiveNum: number = this.pool.length - activeNum
		let itemsStr = this.pool
			.map((item) => {
				return `${item.key}: ${item.active.toString()}`
			})
			.join('\n')

		return `
			Active: ${activeNum}
			Inactive: ${inactiveNum}
			Total: ${this.pool.length}
			=============================
			${itemsStr}
			`
	}

	public destroy(): void {
		this.pool.forEach((item) => item.destroy())
		this.pool = null
	}
}
