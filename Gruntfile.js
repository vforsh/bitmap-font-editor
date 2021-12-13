const getGameConfig = () => {
	return require("./dev/js/game.config.js")
}

const backgrounds = [
	"./dev/assets/graphics/page_background.png",
	"./dev/assets/graphics/gameplay_bg_1.png",
	"./dev/assets/graphics/level_map_*.png",
]

const backgroundsExclude = backgrounds.map(image => `!${image}`)

/**
 * @param {IGrunt} grunt
 */
module.exports = function(grunt) {

	grunt.initConfig({
		clean: {
			main: {
				src: ["./prod/*"],
				options: { force: true },
			},

			prod_js: {
				src: [
					"./prod/js/*.js",
					"!./prod/js/cache-busters.js",
					"!./prod/js/vendor.min.js",
					"!./prod/js/game.min.js",
					"!./prod/js/game.js",
					"!./prod/js/GameAnalytics.min.js",
				],
				options: { force: true },
			},

			prod_css: {
				src: [
					"./prod/css/bundle.css",
				],
				options: { force: true },
			},

			archives: {
				src: ["./*.zip"],
				options: { force: true },
			},

			bitmap_fonts: {
				src: ["./dev/assets/fonts/bitmap/*.zip"],
				options: { force: true },
			},

			css: {
				src: [
					"./prod/css/*.css",
					"!./prod/css/fonts.css",
					"!./prod/css/editor.css",
					"!./prod/css/bundle.css",
				],
				options: { force: true },
			},

			compressed_graphics: {
				src: [
					"dev/assets/graphics/avif",
					"dev/assets/graphics/jpg",
					"dev/assets/graphics/png-compressed",
					"dev/assets/graphics/webp",
				],
				options: { force: true },
			},

			fonts: {
				src: [
					"dev/assets/fonts/bitmap/*.fnt",
				],
				options: { force: true },
			},
		},

		watch: {
			bitmapFonts: {
				files: ["./dev/assets/fonts/bitmap/*.zip"],
				tasks: ["unzip", "clean:bitmap_fonts"],
				options: {
					event: ["added"],
					spawn: false,
				},
			},
			texts: {
				files: ["./dev/assets/texts.json"],
				tasks: ["commands:textsToTypescript"],
				options: {
					event: ["changed"],
					spawn: false,
				},
			},
		},

		unzip: {
			main: {
				src: "./dev/assets/fonts/bitmap/*.zip",
				dest: "./dev/assets/fonts/bitmap/",
			},
		},

		concat: {
			options: {
				separator: ";\n",
			},
			vendor: {
				src: [
					"./prod/js/polyfills.min.js",
					"./prod/js/sentry.min.js",
					"./prod/js/howler.core.min.js",
					"./prod/js/ResizeSensor.js",
					"./prod/js/idb-keyval.min.js",
					"./prod/js/phaser.custom.min.js",
					"./prod/js/rexawaitloaderplugin.min.js",
					"./prod/js/rexwebfontloaderplugin.min.js",
				],
				dest: "./prod/js/vendor.js",
			},
			css: {
				options: {
					separator: "\n",
				},
				src: [
					"./prod/css/*.css",
					"!./prod/css/fonts.css",
					"!./prod/css/editor.css",
				],
				dest: "./prod/css/bundle.css",
			},
		},

		template: {
			options: {
				data: () => {
					let config = getGameConfig()
					return {
						title: config.game_title,
					}
				},
			},

			prod_index_html: {
				files: {
					"./prod/index.html": "./dev/index-prod.html.tpl",
				},
			},
		},

		copy: {
			main: {
				files: [
					{
						expand: true,
						cwd: "./dev/",
						src: [
							"**",
							"!index.html",
							"!*.tpl",
							"!assets/configs/levels/_levels.json",
							"!assets/graphics/**",
							"!js/**/*",
							"js/game.js",
							"js/GameAnalytics.min.js",
							"js/howler.core.min.js",
							"js/idb-keyval.min.js",
							"js/phaser.custom.min.js",
							"js/polyfills.min.js",
							"js/ResizeSensor.js",
							"js/rexawaitloaderplugin.min.js",
							"js/rexwebfontloaderplugin.min.js",
							"js/sentry.min.js",
						],
						dest: "./prod/",
					},
				],
			},

			graphics: {
				files: [
					{
						expand: true,
						flatten: true,
						cwd: "./dev/assets/graphics/",
						src: [
							"*.json",
							"*.jpg",
							"*.png",
							"avif/*.avif",
							"png-compressed/*.png",
							"webp/*.webp",
							...backgrounds.map(bg => "!" + bg.slice(bg.lastIndexOf("/") + 1)),
						],
						dest: "./prod/assets/graphics/",
					},
				],
			},

			rename_fnt: {
				files: [{
					expand: true,
					dot: true,
					cwd: "./dev/assets/fonts/bitmap/",
					dest: "./dev/assets/fonts/bitmap/",
					src: [
						"*.fnt",
					],
					rename: function(dest, src) {
						return dest + src.replace(".fnt", ".xml")
					},
				}],
			},
		},

		replaceFiles: [{
			src: "./dev/js/game.config.js",
			dest: "./dev/js/game.config.js",
		}],
		replace: {
			build_time: {
				options: {
					patterns: [{
						match: /build_time: "(.*)"/,
						replacement: (match, buildTime) => {
							let date = new Date()
							let firstPart = date.toLocaleDateString()
							let secondPart = date.toTimeString().slice(0, 8)
							return `build_time: "${firstPart} ${secondPart}"`
						},
					}],
				},
				files: "<%= replaceFiles %>",
			},
			build_version: {
				options: {
					patterns: [{
						match: /build_version: (\d+)/,
						replacement: (match, buildVersion) => {
							let currentBuild = parseInt(buildVersion)
							let newBuild = currentBuild + 1
							grunt.log.subhead(`Build version: ${newBuild}`)
							return `build_version: ${newBuild}`
						},
					}],
				},
				files: "<%= replaceFiles %>",
			},
		},

		pngquant: {
			main: {
				speed: 2,
				dithering: 0.5,
				quality: [0, 1],
				hashes: true,
				src: [
					"./dev/assets/graphics/*.png",
					...backgroundsExclude,
				],
				dest: "./dev/assets/graphics/png-compressed/",
			},
		},

		png2jpg: {
			backgrounds: {
				quality: 75,
				hashes: true,
				src: [
					...backgrounds,
				],
				dest: "./dev/assets/graphics/jpg/",
			},
		},

		png2webp: {
			main: {
				quality: 90,
				method: 6,
				hashes: true,
				src: [
					"./dev/assets/graphics/*.png",
					...backgroundsExclude,
				],
				dest: "./dev/assets/graphics/webp/",
			},
			backgrounds: {
				quality: 85,
				method: 6,
				hashes: true,
				src: [
					...backgrounds,
				],
				dest: "./dev/assets/graphics/webp/",
			},
		},

		png2avif: {
			main: {
				quality: 27,
				qualityAlpha: 30,
				speed: 1,
				hashes: true,
				src: [
					"./dev/assets/graphics/*.png",
					...backgroundsExclude,
				],
				dest: "./dev/assets/graphics/avif/",
			},
			backgrounds: {
				quality: 35,
				qualityAlpha: 35,
				speed: 1,
				hashes: true,
				src: [
					...backgrounds,
				],
				dest: "./dev/assets/graphics/avif/",
			},
		},

		compress: {
			options: {
				mode: "zip",
				level: 9,
			},
			main: {
				options: {
					archive: () => {
						let config = getGameConfig()
						let gameTitle = config.game_title
						let buildVersion = config.build_version
						let archiveName = gameTitle.split(" ").join("_")
						return `${archiveName}_v${buildVersion.toString()}.zip`
					},
				},
				expand: true,
				cwd: "./prod/",
				src: [
					"**",
					"!js/game.??????????.js",
				],
			},
		},

		commands: {
			textsToTypescript: {
				cmd: "json-ts ./dev/assets/texts.json --prefix 0 --rootName ILanguages --namespace texts > ./src/ITexts.ts",
			},
			tsc: {
				cmd: "tsc --project ./tsconfig.prod.json",
			},
			game_prod_build: {
				cmd: "node ./scripts/build/prod.js",
			},
			game_prod_build_es6: {
				cmd: "node ./scripts/build/prod-es6.js",
			},
			minify_vendor: {
				cmd: `esbuild --minify ./prod/js/vendor.js --target=es5 --outfile=./prod/js/vendor.min.js --legal-comments=none`,
			},
			minify_css: {
				cmd: `esbuild --minify ./prod/css/bundle.css --outfile=./prod/css/bundle.min.css`,
			},
		},

		rsync: {
			main: {
				rsync: "C:/cwrsync_6.2.1_x64_free/bin/rsync.exe",
				ssh: "C:/cwrsync_6.2.1_x64_free/bin/ssh.exe",
				sshKey: "C:/Users/yafor/YandexDisk/robowhale/new/ssh-priv",
				host: "root@robowhale.com",
				source: "./prod",
				destination: "/var/www/html5/candy-cash/main",
				exclude: ["js/game.js"],
				args: "--archive --compress --delete --human-readable --checksum --verbose --chmod=Du=rwx,Dgo=rx,Fu=rw,Fog=r",
			},
		},

		bunnyNetPurge: {
			main: {
				accessKey: "bc3ff129-340d-4e55-bf48-4a2b95c92c3247dd6892-4044-4935-ac46-c3897203fa0d",
				urls: [
					"https://games.robowhale.com/papa-cherry-2/yandex/",
				],
			},
		},

		cache_busting: {
			options: {
				method: "query-strings", // query-strings | filenames
				cache_busters: {
					template: "dev/js/cache-busters.js",
					dest: "prod/js/cache-busters.js",
				},
				gameJs: {
					game: "js/game.js",
					min: "js/game.min.js",
					map: "js/game.min.js.map",
					index: "index.html",
				},
				transformContent: {
					ignoreEntries: ["js/game.min.js"],
					files: [
						"css/fonts.css",
						"index.html",
					],
				},
			},
			main: {
				filter: "isFile",
				cwd: "./prod/",
				src: [
					`css/**`,
					`js/*.js`,
					`assets/**`,
				],
			},
		},

		print_url: {
			deploy_play: {
				text: "Play",
				base: "https://robowhale.com/html5/candy-cash/main/",
				query: {
					unlockLevels: "all",
					gdDisable: 1,
					fakeAds: 1,
				},
			},
			upload: {
				text: "Upload",
				base: "https://robowhale.com/html5/candy-cash/main/",
			},
		},

		filesize: {
			bundle: {
				format: "list", // list | table
				filter: "isFile",
				cwd: "./prod/",
				src: [
					"js/game.js",
					"js/game.min.js",
				],
			},
		},

		split_levels: {
			main: {
				source: "./dev/assets/configs/levels/_levels.json",
				outDir: "./dev/assets/configs/levels/",
			},
		},
	})

	grunt.loadNpmTasks("grunt-contrib-concat")
	grunt.loadNpmTasks("grunt-contrib-clean")
	grunt.loadNpmTasks("grunt-contrib-copy")
	grunt.loadNpmTasks("grunt-contrib-compress")
	grunt.loadNpmTasks("grunt-template")
	grunt.loadNpmTasks("grunt-zip")
	grunt.loadNpmTasks("grunt-commands")
	grunt.loadNpmTasks("grunt-replace")
	grunt.loadTasks("scripts/grunt-tasks")

	grunt.registerTask("rename-fnt", ["copy:rename_fnt", "clean:fonts"])
	grunt.registerTask("update-build-time", ["replace:build_time"])
	grunt.registerTask("update-build-version", ["replace:build_version"])
	grunt.registerTask("build-game", ["commands:tsc", "commands:game_prod_build", "filesize:bundle"])
	grunt.registerTask("build-game-es6", ["commands:game_prod_build_es6", "filesize:bundle"])
	grunt.registerTask("build-vendor", ["concat:vendor", "commands:minify_vendor"])
	grunt.registerTask("build-css", ["concat:css", "clean:css", "commands:minify_css"])
	grunt.registerTask("compress-graphics", ["pngquant", "png2webp", "png2jpg", "png2avif"])
	grunt.registerTask("copy-prod", ["copy:main", "copy:graphics"])
	grunt.registerTask("clean-prod", ["clean:prod_css", "clean:prod_js", "clean:archives"])
	grunt.registerTask("build", ["clean:main", "compress-graphics", "split_levels", "copy-prod", "build-css", "build-game-es6", "build-vendor", "clean-prod", "template", "cache_busting:main"])
	grunt.registerTask("deploy", ["build", "rsync", "print_url:deploy_play"])
	grunt.registerTask("default", ["deploy"])
}
