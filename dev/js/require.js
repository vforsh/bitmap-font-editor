"use strict";

// esbuild tries to load these packages via require so I have to provide "require" in the runtime
function require(lib) {
	var map = {
		"howler": window,
		"@sentry/browser": Sentry,
		"@sentry/types": Sentry,
		"css-element-queries": { ResizeSensor },
		"idb-keyval": idbKeyval,
	}

	return map[lib] || window[lib]
}
