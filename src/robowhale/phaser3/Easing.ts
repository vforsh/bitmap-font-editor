export enum Ease {
	Linear = 'Linear',
	Stepped = 'Stepped',

	QuadIn = 'Quadratic.In',
	CubicIn = 'Cubic.In',
	QuartIn = 'Quartic.In',
	QuintIn = 'Quintic.In',
	SineIn = 'Sine.In',
	ExpoIn = 'Expo.In',
	CircIn = 'Circular.In',
	ElasticIn = 'Elastic.In',
	BackIn = 'Back.In',
	BounceIn = 'Bounce.In',

	QuadOut = 'Quadratic.Out',
	CubicOut = 'Cubic.Out',
	QuartOut = 'Quartic.Out',
	QuintOut = 'Quintic.Out',
	SineOut = 'Sine.Out',
	ExpoOut = 'Expo.Out',
	CircOut = 'Circular.Out',
	ElasticOut = 'Elastic.Out',
	BackOut = 'Back.Out',
	BounceOut = 'Bounce.Out',

	QuadInOut = 'Quadratic.InOut',
	CubicInOut = 'Cubic.InOut',
	QuartInOut = 'Quartic.InOut',
	QuintInOut = 'Quintic.InOut',
	SineInOut = 'Sine.InOut',
	ExpoInOut = 'Expo.InOut',
	CircInOut = 'Circular.InOut',
	ElasticInOut = 'Elastic.InOut',
	BackInOut = 'Back.InOut',
	BounceInOut = 'Bounce.InOut',
}

export const CustomEase = {
	// https://stackoverflow.com/questions/13097005/easing-functions-for-bell-curves
	Bell: (t, a = 1) => Math.pow(4, a) * Math.pow(t * (1 - t), a),
	BellCbrt: (t) => Math.cbrt(4) * Math.cbrt(t * (1 - t)),
	BellSqrt: (t) => Math.sqrt(4) * Math.sqrt(t * (1 - t)),
	BellBasic: (t) => 4 * (t * (1 - t)),
	BellQuad: (t) => 4 * 4 * (t * (1 - t) * (t * (1 - t))),
	BellCubic: (t) => 4 * 4 * 4 * (t * (1 - t) * (t * (1 - t)) * (t * (1 - t))),
}
