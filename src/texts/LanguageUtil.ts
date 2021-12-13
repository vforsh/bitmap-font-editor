export const LANGUAGES_MAP = {
	ru: "Русский",
	en: "English",
	fr: "Français",
	it: "Italiano",
	de: "Deutsch",
	es: "Español",
	nl: "Nederlands",
	no: "Norsk",
	fi: "Suomi",
	br: "Brasileiro",
	pt: "Português",
	jp: "日本語",
	ar: "العربية",
	tr: "Türkçe",
	se: "Svenska",
	pl: "Polski",
}

export function getLanguageTitle(shortCode: string): string {
	return LANGUAGES_MAP[shortCode]
}

export function convertLanguageCodeToGameLanguage(code: string): string {
	switch (code) {
		case "pt-BR":
			return "br"
		
		case "ja-JP":
		case "ja-jp":
		case "ja":
			return "jp"
		
		case "uk-UA":
		case "uk-ua":
		case "uk":
			return "ru"
		
		default:
			return code.split("-")[0].toLowerCase()
	}
}
