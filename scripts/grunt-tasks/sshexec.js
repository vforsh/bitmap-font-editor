/*
 * grunt-ssh
 * https://github.com/andrewrjones/grunt-ssh
 *
 * Copyright (c) 2013 Andrew Jones
 * Licensed under the MIT license.
 */

// TODO: use passphrase
// TODO: unit tests
module.exports = function (grunt) {
	'use strict';

	grunt.util = grunt.util || grunt.utils;

	grunt.registerMultiTask('sshexec', 'Executes a shell command on a remote machine', function () {
		var utillib = require('./sftp-lib/util').init(grunt);
		var Connection = require('ssh2');
		var c = new Connection();

		var done = this.async();

		var commands = utillib.validateStringArrayAndProcess('command', this.data.command);

		var options = this.options({
			config: false,
			host: false,
			username: false,
			password: false,
			agent: "",
			agentForward: false,
			port: utillib.port,
			proxy: {
				port: utillib.port
			},
			ignoreErrors: false,
			minimatch: {},
			pty: {},
			suppressRemoteErrors: false,
			callback: function() {}
		});

		grunt.verbose.writeflags(options, 'Raw Options');

		function setOption(optionName) {
			var option;
			if ((!options[optionName]) && (option = grunt.option(optionName))) {
				options[optionName] = option;
			}
		}
		setOption('config');

		if (options.config && grunt.util._(options.config).isString()) {
			this.requiresConfig(['sshconfig', options.config]);
			var configOptions = grunt.config.get(['sshconfig', options.config]);
			options = grunt.util._.extend(options, configOptions);
		}

		setOption('username');
		setOption('password');
		setOption('passphrase');

		grunt.verbose.writeflags(options, 'Options');

		c.on('keyboard-interactive', function(){
			var prompts = arguments[3];
			var reply = arguments[4];

			prompts.forEach(function(question){
				var msg = question.prompt.toLowerCase();

				if (msg.indexOf('password') !== -1){
					reply([options.password]);
				}
			});
		});

		c.on('connect', function () {
			grunt.verbose.writeln('Connection :: connect');
		});
		c.on('ready', function () {
			grunt.verbose.writeln('Connection :: ready');
			execCommand();
		});
		c.on('error', function (err) {
			grunt.fail.warn('Connection :: error :: ' + err);
		});
		c.on('debug', function (message) {
			grunt.log.debug('Connection :: debug :: ' + message);
		});
		c.on('end', function () {
			grunt.verbose.writeln('Connection :: end');
		});
		c.on('close', function (had_error) {
			grunt.verbose.writeln('Connection :: close');
			grunt.verbose.writeln('finishing task');
			done();
		});


		function execCommand() {
			if (commands.length === 0) {
				c.end();
			} else {
				var command = commands.shift();
				grunt.verbose.writeln('Executing :: ' + command);
				c.exec(command, options, function (err, stream) {
					if (err) {
						throw err;
					}
					var out;
					stream.on('data', function (data, extended) {
						out = String(data);
						if (extended === 'stderr') {
							if (!options.suppressRemoteErrors) {
								grunt.log.warn(out);
							}
							else {
								grunt.verbose.warn(out);
							}
						} else {
							grunt.log.write(out);
						}
					});
					stream.on('end', function () {
						grunt.verbose.writeln('Stream :: EOF');
						if (out && typeof options.callback === "function") {
							options.callback(out.trim());
						}
					});
					stream.on('exit', function () {
						grunt.verbose.writeln('Stream :: exit');
					});
					stream.on('close', function (code, signal) {
						grunt.verbose.writeln('Stream :: close :: code: ' + code + ', signal: ' + signal);
						if (!options.ignoreErrors && code !== 0) {
							grunt.fail.warn('Error executing task ' + command);
							c.end();
						} else {
							execCommand();
						}
					});
				});
			}
		}

		var connectionOptions = utillib.parseConnectionOptions(options);
		connectionOptions.tryKeyboard = true;
		if (options.proxy.host) {
			var proxyConnectionOptions = utillib.parseConnectionOptions(options.proxy);
			var proxyConnection = new Connection();
			proxyConnection.on('connect', function () {
				grunt.verbose.writeln('Proxy connection :: connect');
			});
			proxyConnection.on('error', function (err) {
				grunt.fail.warn('Proxy connection :: error :: ' + err);
			});
			proxyConnection.on('ready', function() {
				grunt.verbose.writeln('Proxy connection :: ready');
				proxyConnection.exec('nc ' + connectionOptions.host + ' ' + connectionOptions.port, function(err, stream) {
					if (err) {
						proxyConnection.end();
						throw err;
					}
					connectionOptions.sock = stream;
					c.connect(connectionOptions);
				});
			});
			proxyConnection.connect(proxyConnectionOptions);
		}
		else {
			c.connect(connectionOptions);
		}
	});
};
