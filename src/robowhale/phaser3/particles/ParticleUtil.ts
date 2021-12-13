type RandomZoneSource = Phaser.Types.GameObjects.Particles.RandomZoneSource
type ParticleEmitterConfig = Phaser.Types.GameObjects.Particles.ParticleEmitterConfig
type ParticleEmitterEdgeZoneConfig = Phaser.Types.GameObjects.Particles.ParticleEmitterEdgeZoneConfig
type ParticleEmitter = Phaser.GameObjects.Particles.ParticleEmitter

export class ParticleUtil {
	
	public static getEmitCircle(x: number, y: number, radius: number): void {
	
	}
	
	public static onEmitRandom(from: number, to: number): { onEmit: () => number } {
		return { onEmit: () => Phaser.Math.RND.realInRange(from, to) }
	}
	
	public static getTextureEmitZone(scene: Phaser.Scene, image: Phaser.GameObjects.Image): RandomZoneSource | null {
		let origin = image.getTopLeft()
		let x, y, pixel
		
		let getRandomPoint = (vec) => {
			do {
				x = Phaser.Math.Between(0, image.width)
				y = Phaser.Math.Between(0, image.height)
				pixel = scene.textures.getPixel(x, y, image.texture.key)
			} while (pixel.alpha < 255)
			
			return vec.setTo(x + origin.x, y + origin.y)
		}
		
		return {
			getRandomPoint,
		}
	}
	
	public static getCircleEdgeEmitZone(radius: number, quantity: number = 360, randomize: boolean = true): ParticleEmitterConfig {
		let circle = new Phaser.Geom.Circle(0, 0, radius)
		let emitZone: ParticleEmitterEdgeZoneConfig = { source: circle, type: "edge", quantity }
		
		let getRotation = (particle) => {
			let emitter = particle.emitter
			let emitterX: number = emitter.follow ? emitter.follow.x : emitter.x.propertyValue
			let emitterY: number = emitter.follow ? emitter.follow.y : emitter.y.propertyValue
			return Math.atan2(particle.y - emitterY, particle.x - emitterX)
		}
		
		let randomizeProperties = randomize
			? {
				emitCallback: (particle, emitter: ParticleEmitter) => {
					let emitZone = emitter.emitZone as any
					emitZone.counter = Phaser.Math.RND.between(0, emitZone.points.length)
				},
			}
			: {}
		
		return {
			...randomizeProperties,
			emitZone,
			angle: {
				onEmit: (particle) => {
					return getRotation(particle) * Phaser.Math.RAD_TO_DEG
				},
			},
			rotate: {
				onEmit: (particle) => {
					return (getRotation(particle) + Math.PI / 2) * Phaser.Math.RAD_TO_DEG
				},
			},
		}
	}
}
