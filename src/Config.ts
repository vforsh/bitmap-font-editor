export class Config {
	public static SOURCE_GAME_WIDTH: number = 750
	public static SOURCE_GAME_HEIGHT: number = 1000
	public static IS_LANDSCAPE: boolean = Config.SOURCE_GAME_WIDTH > Config.SOURCE_GAME_HEIGHT
	public static IS_PORTRAIT: boolean = Config.SOURCE_GAME_HEIGHT >= Config.SOURCE_GAME_WIDTH
	public static GAME_WIDTH: number = Config.SOURCE_GAME_WIDTH
	public static GAME_HEIGHT: number = Config.SOURCE_GAME_HEIGHT
	public static HALF_GAME_WIDTH: number = Config.GAME_WIDTH * 0.5
	public static HALF_GAME_HEIGHT: number = Config.GAME_HEIGHT * 0.5
	public static ASPECT_RATIO: number = Config.SOURCE_GAME_WIDTH / Config.SOURCE_GAME_HEIGHT
	public static ASSETS_SCALE: number = 1
}
