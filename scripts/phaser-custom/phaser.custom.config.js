/**
 * @author       Richard Davey <rich@photonstorm.com>
 * @copyright    2019 Photon Storm Ltd.
 * @license      {@link https://github.com/photonstorm/phaser/blob/master/license.txt|MIT License}
 */

require('phaser/src/polyfills');

var CONST = require('phaser/src/const');
var Extend = require('phaser/src/utils/object/Extend');

/**
 * @namespace Phaser
 */

var Phaser = {

	Actions: {
		GridAlign: require('phaser/src/actions/GridAlign'),
	},
	// Animations: require('phaser/src/animations'),
	Cache: require('phaser/src/cache'),
	Cameras: require('phaser/src/cameras'),
	Core: require('phaser/src/core'),
	Curves: {
		Spline: require('phaser/src/curves/SplineCurve'),
		Ellipse: require('phaser/src/curves/EllipseCurve'),
		// QuadraticBezier: require('phaser/src/curves/QuadraticBezierCurve'),
	},
	Data: require('phaser/src/data'),
	Display: {
		Align: require('phaser/src/display/align'),
		Bounds: require('phaser/src/display/bounds'),
		Masks: require('phaser/src/display/mask'),
		Canvas: require('phaser/src/display/canvas'),
		Color: require('phaser/src/display/color'),
	},
	Events: require('phaser/src/events/index'),
	Game: require('phaser/src/core/Game'),
	GameObjects: {
		Events: require('phaser/src/gameobjects/events'),
		RenderTexture: require('phaser/src/gameobjects/rendertexture/RenderTexture'),
		Container: require('phaser/src/gameobjects/container/Container'),
		DisplayList: require('phaser/src/gameobjects/DisplayList'),
		GameObjectCreator: require('phaser/src/gameobjects/GameObjectCreator'),
		GameObjectFactory: require('phaser/src/gameobjects/GameObjectFactory'),
		UpdateList: require('phaser/src/gameobjects/UpdateList'),
		Components: require('phaser/src/gameobjects/components'),
		BuildGameObject: require('phaser/src/gameobjects/BuildGameObject'),
		BuildGameObjectAnimation: require('phaser/src/gameobjects/BuildGameObjectAnimation'),
		GameObject: require('phaser/src/gameobjects/GameObject'),
		Graphics: require('phaser/src/gameobjects/graphics/Graphics.js'),
		Image: require('phaser/src/gameobjects/image/Image'),
		Shape: require('phaser/src/gameobjects/shape/Shape'),
		Ellipse: require('phaser/src/gameobjects/shape/ellipse/Ellipse'),
		Line: require('phaser/src/gameobjects/shape/line/Line'),
		Rectangle: require('phaser/src/gameobjects/shape/rectangle/Rectangle'),
		Group: require('phaser/src/gameobjects/group/Group'),
		Sprite: require('phaser/src/gameobjects/sprite/Sprite'),
		Text: require('phaser/src/gameobjects/text/Text'),
		BitmapText: require('phaser/src/gameobjects/bitmaptext/static/BitmapText'),
		Particles: require('phaser/src/gameobjects/particles'),
		// Mesh: require('phaser/src/gameobjects/mesh/Mesh'),
		Factories: {
			Container: require('phaser/src/gameobjects/container/ContainerFactory'),
			Graphics: require('phaser/src/gameobjects/graphics/GraphicsFactory'),
			Group: require('phaser/src/gameobjects/group/GroupFactory'),
			Image: require('phaser/src/gameobjects/image/ImageFactory'),
			Sprite: require('phaser/src/gameobjects/sprite/SpriteFactory'),
			Text: require('phaser/src/gameobjects/text/TextFactory'),
			BitmapText: require('phaser/src/gameobjects/bitmaptext/static/BitmapTextFactory'),
			Particles: require('phaser/src/gameobjects/particles/ParticleManagerFactory'),
			RenderTexture: require('phaser/src/gameobjects/rendertexture/RenderTextureFactory.js'),
			Line: require('phaser/src/gameobjects/shape/line/LineFactory'),
			Rectangle: require('phaser/src/gameobjects/shape/rectangle/RectangleFactory'),
			Ellipse: require('phaser/src/gameobjects/shape/ellipse/EllipseFactory'),
			// Mesh: require('phaser/src/gameobjects/mesh/MeshFactory'),
		},
		Creators: {
			Graphics: require('phaser/src/gameobjects/graphics/GraphicsCreator'),
			Image: require('phaser/src/gameobjects/image/ImageCreator'),
			Text: require('phaser/src/gameobjects/text/TextCreator'),
			BitmapText: require('phaser/src/gameobjects/bitmaptext/static/BitmapTextCreator'),
			RenderTexture: require('phaser/src/gameobjects/rendertexture/RenderTextureCreator'),
		}
	},
	Geom: {
		Point: require('phaser/src/geom/point'),
		// Line: require('phaser/src/geom/line"),
		Rectangle: require('phaser/src/geom/rectangle'),
		Circle: require('phaser/src/geom/circle'),
	},
	Input: require('phaser/src/input'),
	Loader: {
		Events: require('phaser/src/loader/events'),
		FileTypes: {
			// AnimationJSONFile: require('phaser/src/loader/filetypes/AnimationJSONFile'),
			AtlasJSONFile: require('phaser/src/loader/filetypes/AtlasJSONFile'),
			// AudioFile: require('phaser/src/loader/filetypes/AudioFile'),
			BitmapFontFile: require('phaser/src/loader/filetypes/BitmapFontFile'),
			CSSFile: require('phaser/src/loader/filetypes/CSSFile'),
			// AudioSpriteFile: require('phaser/src/loader/filetypes/AudioSpriteFile'),
			// GLSLFile: require('phaser/src/loader/filetypes/GLSLFile'),
			// HTML5AudioFile: require('phaser/src/loader/filetypes/HTML5AudioFile'),
			ImageFile: require('phaser/src/loader/filetypes/ImageFile'),
			JSONFile: require('phaser/src/loader/filetypes/JSONFile'),
			ScriptFile: require('phaser/src/loader/filetypes/ScriptFile'),
			XMLFile: require('phaser/src/loader/filetypes/XMLFile'),
			// TextFile: require('phaser/src/loader/filetypes/TextFile'),
		},
		File: require('phaser/src/loader/File'),
		FileTypesManager: require('phaser/src/loader/FileTypesManager'),
		GetURL: require('phaser/src/loader/GetURL'),
		LoaderPlugin: require('phaser/src/loader/LoaderPlugin'),
		MergeXHRSettings: require('phaser/src/loader/MergeXHRSettings'),
		MultiFile: require('phaser/src/loader/MultiFile'),
		XHRLoader: require('phaser/src/loader/XHRLoader'),
		XHRSettings: require('phaser/src/loader/XHRSettings')
	},
	Math: require('phaser/src/math'),
	Physics: {
		// Matter: require('phaser/src/physics/matter-js"),
		// Arcade: require('phaser/src/physics/"),
	},
	Plugins: require('phaser/src/plugins'),
	Renderer: require('phaser/src/renderer'),
	Scale: require('phaser/src/scale'),
	Scene: require('phaser/src/scene/Scene'),
	Scenes: require('phaser/src/scene'),
	// Sound: require('phaser/src/sound'),
	Structs: {
		Events: require('phaser/src/structs/events'),
		List: require('phaser/src/structs/List'),
		Map: require('phaser/src/structs/Map'),
		ProcessQueue: require('phaser/src/structs/ProcessQueue'),
		// RTree: require('phaser/src/structs/RTree'),
		Set: require('phaser/src/structs/Set'),
		Size: require('phaser/src/structs/Size')
	},
	Textures: require('phaser/src/textures'),
	Time: require('phaser/src/time'),
	Tweens: require('phaser/src/tweens'),
	Utils: {
		Array: require('phaser/src/utils/array'),
		Class: require('phaser/src/utils/Class'),
		Objects: require('phaser/src/utils/object'),
		String: {
			UUID: require('phaser/src/utils/string/UUID'),
		},
	},
};

//   Merge in the consts

Phaser = Extend(false, Phaser, CONST);

//  Export it

module.exports = Phaser;

// global.Phaser = Phaser;
