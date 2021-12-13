import { findKey } from "lodash-es"

const map = {
	en: "English",
	fr: "French",
	it: "Italian",
	de: "German",
	es: "Spanish",
	pt: "Portuguese",
	br: "Brazilian",
	tr: "Turkish",
	ru: "Russian",
	jp: "Japanese",
	ar: "Arabic",
	pl: "Polish",
	nl: "Dutch",
	no: "Norwegian",
	fi: "Finnish",
	se: "Swedish",
	tch: "Traditional Chinese",
}

export function getFullLanguage(shortcut) {
	return map[shortcut]
}

export function getShortcut(language) {
	return findKey(map, (key) => key === language)
}
