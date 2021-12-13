/*
 * grunt-ssh
 * https://github.com/andrewrjones/grunt-ssh
 *
 * Copyright (c) 2013 Andrew Jones
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {
	"use strict"

	grunt.util = grunt.util || grunt.utils

	grunt.registerMultiTask("sftp", "Copy files to a (remote) machine running an SSH daemon.", function() {
		const utillib = require("./sftp-lib/util").init(grunt)
		const sftpHelper = require("./sftp-lib/sftpHelpers").init(grunt)
		const fs = require("fs")
		const async = require("async")
		const Connection = require("ssh2")
		const path = require("path")
		const ProgressBar = require("progress")
		const revHash = require("rev-hash")

		let options = this.options({
			path: "",
			host: false,
			username: false,
			password: false,
			agent: "",
			port: utillib.port,
			proxy: {
				port: utillib.port,
			},
			minimatch: {},
			srcBasePath: "",
			destBasePath: "",
			createDirectories: false,
			directoryPermissions: parseInt("755", 8),
			showProgress: false,
			mode: "upload",
		})

		let tempHashes = {}
		let hashes = options.hashes ? grunt.file.readJSON(options.hashes) : null
		if (hashes) {
			if (hashes.host !== options.host || hashes.path !== options.path) {
				hashes = {
					host: options.host,
					path: options.path,
					hashes: {},
				}
			}
		}

		let tally = {
			dirs: 0,
			files: 0,
		}

		grunt.verbose.writeflags(options, "Raw Options")

		function setOption(optionName) {
			let option
			if ((!options[optionName]) && (option = grunt.option(optionName))) {
				options[optionName] = option
			}
		}

		setOption("config")

		if (options.config && grunt.util._(options.config).isString()) {
			this.requiresConfig(["sshconfig", options.config])
			let configOptions = grunt.config.get(["sshconfig", options.config])
			options = grunt.util._.extend(options, configOptions)
		}

		setOption("username")
		setOption("password")
		setOption("passphrase")
		setOption("showProgress")

		// add trailing slash to path if needed
		if (("" !== options.path) && !options.path.match(/(\/|\\)$/)) {
			options.path = options.path + "/"
		}

		if (("" !== options.destBasePath) && !options.destBasePath.match(/(\/|\\)$/)) {
			options.destBasePath = options.destBasePath + "/"
		}

		grunt.verbose.writeflags(options, "Options")

		let files = this.files

		let c = new Connection()
		let done = this.async()

		c.on("keyboard-interactive", function() {
			let prompts = arguments[3]
			let reply = arguments[4]

			prompts.forEach(function(question) {
				let msg = question.prompt.toLowerCase()

				if (msg.indexOf("password") !== -1) {
					reply([options.password])
				}
			})
		})

		c.on("connect", function() {
			grunt.verbose.writeln("Connection :: connect")
		}).on("ready", function() {

			c.sftp(function(err, sftp) {
				if (err) {
					c.end()
					grunt.log.error(err)
					return
				}
				sftp.on("end", function() {
					grunt.verbose.writeln("SFTP :: session end")
				}).on("close", function(had_error) {
					grunt.verbose.writeln("SFTP :: session close")
				})

				async.eachSeries(files, function(file, callback) {
					let srcFiles = options.mode === "upload" ? grunt.file.expand(options.minimatch, file.src) : file.orig.src
					let fileQueue = []
					let paths = []

					if (options.mode === "download") {
						if (srcFiles.length === 0) {
							return callback(new Error("Unable to copy; no valid remote files were found."))
						}

						srcFiles.forEach(function(srcFile) {
							let downloadSrc = (options.srcBasePath ? options.srcBasePath : options.path) + srcFile
							let downloadDest = options.destBasePath ? file.dest.replace(/^\//, "") : file.dest
							let offsetDirectory = ""
							if (options.srcBasePath.indexOf(options.path) === 0) {
								offsetDirectory = options.srcBasePath.replace(options.path, "")
							}
							if (file.dest[file.dest.length - 1] === "/") {
								downloadDest += srcFile.replace(offsetDirectory, "")
							}

							srcFiles.forEach(function(srcFile) {
								let destFile = options.path
								if (srcFile.indexOf(options.srcBasePath) === 0) {
									destFile += srcFile.replace(options.srcBasePath, "")
								} else {
									destFile += srcFile
								}
								if (grunt.file.isDir(srcFile)) {
									if (paths.indexOf(destFile) === -1) {
										paths.push(destFile)
									}
								} else {
									fileQueue.push({
										src: srcFile,
										dest: destFile,
									})
								}
								let pathName = path.dirname(destFile)
								if (paths.indexOf(pathName) === -1) {
									paths.push(pathName)
								}
							})
							if (options.destBasePath) {
								downloadDest = options.destBasePath + downloadDest
							}

							let count = 1
							let downloadingRecursive = function(src, dest) {
								sftp.open(src, "r", function(err, buffer) {
									if (err) {
										return callback(err)
									}
									sftp.fstat(buffer, function(err, stats) {
										if (err) {
											return callback(err)
										}
										let isDirectory = stats.isDirectory()
										if (isDirectory) {
											grunt.verbose.writeln("Checking existence of path " + dest)
											fs.exists(dest, function(exists) {
												let recursiveCallback = function(directorySrc, directoryDest) {
													sftp.readdir(directorySrc, function(err, list) {
														if (err) {
															return callback(err)
														}
														count--
														count += list.length
														if (!count) {
															callback()
														}
														list.forEach(function(item) {
															downloadingRecursive(path.join(directorySrc, item.filename), path.join(directoryDest, item.filename))
														})
													})
												}
												if (!exists) {
													if (!options.createDirectories) {
														callback()
														return
													}
													fs.mkdir(dest, options.directoryPermissions, function() {
														recursiveCallback(src, dest)
													})
												} else {
													recursiveCallback(src, dest)
												}
											})
										} else {
											let fpOptions = {
												chunkSize: options.chunkSize,
											}
											let downloadFile = function(fileSrc, fileDest) {
												grunt.verbose.writeln("downloading " + fileSrc + " to " + fileDest)
												sftp.fastGet(fileSrc, fileDest, fpOptions, function(err) {
													if (err) {
														return callback(err)
													}
													grunt.verbose.writeln("download " + fileSrc + " to " + fileDest)
													tally.files++
													count--
													if (!count) {
														callback()
													}
												})
											}

											if (options.showProgress) {
												sftp.open(src, "r", function(err, buffer) {
													sftp.fstat(buffer, function(err, stats) {
														if (err) {
															return callback(err)
														}
														let fileSize = stats.size
														let barTemplate = src + " [:bar] :percent of " + utillib.fileSizeReadable(fileSize)

														let bar = new ProgressBar(barTemplate, {
															complete: "=",
															incomplete: " ",
															width: 20,
															total: fileSize,
														})

														fpOptions.step = function(totalSent, lastSent, total) {
															bar.tick(lastSent)
														}
														downloadFile(src, dest)
													})
												})
											} else {
												downloadFile(src, dest)
											}
										}
									})
								})
							}
							let recursiveMkdir = function(dir, mode, callback) {
								let existsFunction = fs.exists || path.exists

								existsFunction(dir, function(exists) {
									if (exists) {
										return callback(null)
									}

									let current = path.resolve(dir)
									let parent = path.dirname(current)

									recursiveMkdir(parent, mode, function(err) {
										if (err) {
											return callback(err)
										}

										fs.mkdir(current, mode, function(err) {
											if (err) {
												return callback(err)
											}
											callback()
										})
									})
								})
							}
							if (options.createDirectories) {
								recursiveMkdir(path.dirname(downloadDest), options.directoryPermissions, function() {
									downloadingRecursive(downloadSrc, downloadDest)
								})
							} else {
								downloadingRecursive(downloadSrc, downloadDest)
							}
						})
					} else {
						if (options.mode === "upload") {
							if (srcFiles.length === 0) {
								return callback(new Error("Unable to copy; no valid source files were found."))
							}

							// TODO - before we start copying files ensure all
							// the directories we are copying into will exist, otherwise
							// the async thingie causes problems

							srcFiles.forEach(function(srcFile) {
								if (grunt.file.isDir(srcFile)) {
									return
								}

								if (hashes) {
									let savedHash = hashes.hashes[srcFile]
									let file = fs.readFileSync(srcFile)
									let hash = revHash(file)
									tempHashes[srcFile] = hash
									if (savedHash && savedHash === hash) {
										grunt.log.writeln(srcFile, "[SKIP]")
										return
									}
								}

								let destFile = options.path
								if (srcFile.indexOf(options.srcBasePath) === 0) {
									destFile += srcFile.replace(options.srcBasePath, "")
								} else {
									destFile += srcFile
								}
								fileQueue.push({
									src: srcFile,
									dest: destFile,
								})
								let pathName = path.dirname(destFile)
								if (paths.indexOf(pathName) === -1) {
									paths.push(pathName)
								}
							})

							async.eachSeries(paths, function(path, callback) {

								if (!options.createDirectories) {
									callback()
									return
								}

								grunt.verbose.writeln("Checking existence of path " + path)
								sftpHelper.sftpRecursiveMkDir(sftp, path, {
									permissions: options.directoryPermissions,
								}, function(result, msg) {
									if (!result) {
										callback(new Error(msg))
									} else {
										callback()
										tally.dirs++
									}
								})
							}, function(err) {
								if (err) {
									callback(new Error("Path creation failed: " + err))
									return
								}

								async.eachSeries(fileQueue, function(file, callback) {
									let fpOptions = {
										chunkSize: options.chunkSize,
									}

									if (options.showProgress) {
										let fileSize = fs.statSync(file.src).size
										let barTemplate = file.src + " [:bar] :percent of " + utillib.fileSizeReadable(fileSize)

										let bar = new ProgressBar(barTemplate, {
											complete: "=",
											incomplete: " ",
											width: 20,
											total: fileSize,
										})

										fpOptions.step = function(totalSent, lastSent, total) {
											bar.tick(lastSent)
										}
									}

									grunt.verbose.writeln("copying " + file.src + " to " + file.dest)
									sftp.fastPut(file.src, file.dest, fpOptions, function(err) {
										if (err) {
											return callback(err)
										}
										grunt.verbose.writeln("copied " + file.src + " to " + file.dest)
										tally.files++

										if (hashes) {
											hashes.hashes[file.src] = tempHashes[file.src]
										}

										callback()
									})
								}, function(err) {
									callback(err)
								})
							})
						}
					}
				}, function(err) {
					if (err) {
						grunt.fail.warn(err)
					}
					c.end()
				})
			})

		}).on("error", function(err) {
			grunt.fail.warn("Connection :: error :: " + err)
		}).on("debug", function(message) {
			grunt.log.debug("Connection :: debug :: " + message)
		}).on("end", function() {
			grunt.verbose.writeln("Connection :: end")
		}).on("close", function(had_error) {
			if (had_error) {
				grunt.log.error(had_error)
			}

			grunt.log.writeln((tally.dirs ? `Created ${tally.dirs.toString().cyan} directories, copied ` : "Copied ") + (tally.files ? `${tally.files.toString().cyan} files` : ""))
			grunt.verbose.writeln("Connection :: close")

			if (hashes) {
				grunt.file.write(options.hashes, JSON.stringify(hashes, null, 4))
			}

			done()
		})

		let connectionOptions = utillib.parseConnectionOptions(options)
		connectionOptions.tryKeyboard = true
		if (options.proxy.host) {
			let proxyConnectionOptions = utillib.parseConnectionOptions(options.proxy)
			let proxyConnection = new Connection()
			proxyConnection.on("connect", function() {
				grunt.verbose.writeln("Proxy connection :: connect")
			})
			proxyConnection.on("error", function(err) {
				grunt.fail.warn("Proxy connection :: error :: " + err)
			})
			proxyConnection.on("ready", function() {
				grunt.verbose.writeln("Proxy connection :: ready")
				proxyConnection.exec("nc " + connectionOptions.host + " " + connectionOptions.port, function(err, stream) {
					if (err) {
						proxyConnection.end()
						throw err
					}
					connectionOptions.sock = stream
					c.connect(connectionOptions)
				})
			})
			proxyConnection.connect(proxyConnectionOptions)
		} else {
			c.connect(connectionOptions)
		}
	})
}
