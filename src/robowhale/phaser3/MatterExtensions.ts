import MatterCollisionPair = Phaser.Types.Physics.Matter.MatterCollisionPair
import Vector2Like = Phaser.Types.Math.Vector2Like
import { callAllMethods } from "../Polyfills"

export class MatterExtensions {
	
	public static extend(): void {
		callAllMethods(MatterExtensions, ["extend"])
	}
	
	public static addIgnoreCollisionCategory(): void {
		let ignoreCollisionCategory = function(value: number): Phaser.GameObjects.GameObject {
			this.body.collisionFilter.mask = ~value
			
			return this
		}
		
		Phaser.Physics.Matter.Image.prototype.ignoreCollisionCategory = ignoreCollisionCategory
		
		Phaser.Physics.Matter.Sprite.prototype.ignoreCollisionCategory = ignoreCollisionCategory
	}
	
	public static addGetContactPoint(): void {
		Phaser.Physics.Matter.World.prototype.getContactPoint = (pair: MatterCollisionPair, out?: Vector2Like): Vector2Like => {
			let contact = pair.activeContacts[0] as any
			let x: number = contact.vertex.x - pair.collision.penetration.x
			let y: number = contact.vertex.y - pair.collision.penetration.y
			
			out = out ?? (out || { x, y })
			
			return out
		}
	}
}
