export enum FontWeight {
	NORMAL = '400',
	BOLD = '700',
}

export enum FontFamily {
	POETSEN = 'PoetsenOne',
	SANS_SERIF = 'sans-serif',
}

export class WebFonts {
	public static DEFAULT_FAMILY: FontFamily = FontFamily.POETSEN
	public static DEFAULT_WEIGHT: FontWeight = FontWeight.NORMAL
}

export enum BitmapFont {
	LEVEL_EDITOR_GRID = 'LEVEL_EDITOR_GRID',
	GAME_FIELD_LABELS = 'GAME_FIELD_LABELS',
	LEVEL_ICONS_CLASSIC = 'LEVEL_ICONS_CLASSIC',
	LEVEL_ICONS_HARD = 'LEVEL_ICONS_HARD',
	POPUP_GOAL_LABELS = 'POPUP_GOAL_LABELS',
	PREGAME_BOOSTERS_LABELS = 'PREGAME_BOOSTERS_LABELS',
	TOP_PANEL_GOAL_LABELS = 'TOP_PANEL_GOAL_LABELS',
	MOVES_LABEL = 'MOVES_LABEL',
	LEVEL_MAP_BOTTOM_LABELS = 'LEVEL_MAP_BOTTOM_LABELS',
	LEVEL_MAP_TOP_PANEL = 'LEVEL_MAP_TOP_PANEL',
	LEVELS_EDITOR_LIST = 'LEVELS_EDITOR_LIST',
	POWERUP_CHEF = 'POWERUP_CHEF',
	BOOSTER_LABELS = 'BOOSTER_LABELS',
	SHOP_COINS = 'SHOP_COINS',
	LABELS_POPUPS = 'LABELS_POPUPS',
	DEBUG_LEVEL_ICONS = 'DEBUG_LEVEL_ICONS',
	LABELS_GAMEPLAY_GUI = 'LABELS_GAMEPLAY_GUI',
	GENERATOR_TURNS = 'GENERATOR_TURNS',
	TABLECLOTH_BASKETS = 'TABLECLOTH_BASKETS',
}

export const INFINITY_SIGN = '∞'
