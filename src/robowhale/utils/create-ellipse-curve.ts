import Vector2Like = Phaser.Types.Math.Vector2Like

export function createEllipseCurve(start: Required<Vector2Like>, end: Required<Vector2Like>, width: number): Phaser.Curves.Ellipse {
	let distance = Phaser.Math.Distance.BetweenPoints(start, end)
	let angle = Phaser.Math.Angle.BetweenPoints(end, start)

	let newDistance = distance / 2
	let ellipseCenterX = start.x - Math.cos(angle) * newDistance
	let ellipseCenterY = start.y - Math.sin(angle) * newDistance
	let ellipse = new Phaser.Curves.Ellipse(ellipseCenterX, ellipseCenterY, width, distance / 2, 90, 270)
	ellipse.setRotation(angle - Math.PI / 2)

	return ellipse
}
