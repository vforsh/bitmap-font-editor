import { times } from 'lodash-es'

export type PoolItem = { active: boolean }

export type CreatePoolItemCallback<T extends PoolItem> = (...args: any[]) => T

export interface PoolOptions<T extends PoolItem> {
	createCallback: CreatePoolItemCallback<T>
	initialSize?: number
}

export class Pool<T extends PoolItem> {
	private createCallback: CreatePoolItemCallback<T>
	private items: T[]

	constructor(options: PoolOptions<T>) {
		this.createCallback = options.createCallback
		this.items = times(options.initialSize ?? 0, () => {
			return options.createCallback()
		})
	}

	public getFirstInactive(): T {
		let inactive = this.items.find((item) => item.active === false)
		if (inactive) {
			return inactive
		}

		let newItem = this.createCallback()
		this.items.push(newItem)
		return newItem
	}

	public destroy(): void {
		this.items = null
	}
}
