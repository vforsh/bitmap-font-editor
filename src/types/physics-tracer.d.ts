declare namespace PhysicsTracer {
	export type Config = {
		// generator_info: string
		[key: string]: Item
	}
	
	export interface Item {
		type: "fromPhysicsTracer"
		label: string
		vertices: Phaser.Types.Math.Vector2Like[][]
	}
}
