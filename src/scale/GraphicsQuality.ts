export enum GraphicsQuality {
	LOW = "low",
	MEDIUM = "medium",
	HIGH = "high",
}

export function getGraphicsQualityAsNumber(quality: GraphicsQuality): number {
	switch (quality) {
		case GraphicsQuality.LOW:
			return 0.5
		
		case GraphicsQuality.MEDIUM:
			return 0.75
		
		case GraphicsQuality.HIGH:
			return 1
		
		default:
			return 1
	}
}

export function isGraphicsQualityOption(value: string | null): value is GraphicsQuality {
	// @ts-ignore
	return GRAPHICS_QUALITY_OPTIONS.includes(value)
}

export const GRAPHICS_QUALITY_OPTIONS = Object.values(GraphicsQuality)
