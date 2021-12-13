declare namespace PhysicsEditor {
	export type Config = {
		// generator_info: string
		[key: string]: Item
	}

	export interface Item {
		type: "fromPhysicsEditor"
		label: string
		isStatic: boolean
		density: number
		restitution: number
		friction: number
		frictionAir: number
		frictionStatic: number
		collisionFilter: CollisionFilter
		fixtures: Fixture[]
	}

	export interface CollisionFilter {
		group: number
		category: number
		mask: number
	}

	export interface Fixture {
		label: string
		isSensor: boolean
		vertices: Phaser.Types.Math.Vector2Like[][]
	}
}
