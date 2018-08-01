require('dotenv').config()
// Webpack dependency and configuration object
const webpack = require('webpack');
const path = require('path');
let request = require('request');
// Store cookies global
request = request.defaults({jar: true});
let sessionCookies = [];
let codeBlocksId = 0;

// Command line argument
const args = { a: null, file: null, online: false };
// Alignment number option
// TODO: looks irrelevant now as the --file does the same but will have meaning when filename policy is implemented
if (process.argv.indexOf('--align') !== -1) args.align = process.argv[process.argv.indexOf('--align') + 1];
// Specific file name option
if (process.argv.indexOf('--file') !== -1) args.file = process.argv[process.argv.indexOf('--file') + 1];
// Offline status option - default false
if (process.argv.indexOf('--online') !== -1) args.online = true;

// Code bundle
let bundle = '';

// Plugin conde
class CMate {
	apply (compiler) {
		compiler.plugin('emit', (compilation, cb) => {
			// Check each chunk
			// Each chunk manages the composition of a final rendered assets
			compilation.chunks.forEach(chunk => {
				// Modules represent each file and dependency
				for (const module of chunk.modulesIterable) {
					if (module._source) {
						// Clean format the dependency name
						let fileId = module.id.split(/\//gi);
						fileId = fileId[fileId.length - 1];
						fileId = fileId.replace(/\.js$/i,'') // If there is the .js suffix

						if (module.issuer.id === 0) { // nothing depends on this file = main file
							bundle = module._source._value;
						} else {
							// Match with bundle
							const reqIndex = bundle.match(/require\((\'|\")[A-Za-z0-9.,\/\\\-\+\$\_\@\&]+(\'|\")\)\;/gi);

							// Clean format of dependenciesRequire
							let reqIndexClean = reqIndex.map((depReqPath) => {
								let depReq = depReqPath.split(/\//gi);
								return depReq[depReq.length - 1].replace(/(\'|\")\)\;/i,'');
							});

							// If the current module file and dependency require file match
							if (reqIndexClean.indexOf(fileId) !== -1) {
								// reqIndex and reqIndexClean have same index
								let indexRequire = reqIndex[reqIndexClean.indexOf(fileId)];
								let headerInject = `//----------------------------\n// CMate injector\n// Source: ${module.id}\n// Dependency parent: ${module.issuer.id}\n`;
								let footerInject = `//----------------------------\n`;
								// Inject code over require
								bundle = bundle.replace(indexRequire, headerInject + module._source._value + footerInject);
							}
						}
					}
				}
			});

			// Clean requires for duplicated dependencies
			bundle = bundle.replace(/require\((\'|\")[A-Za-z0-9.,\/\\\-\+\$\_\@\&]+(\'|\")\)\;/gi, '');

			// Overwrite bundle
			compilation.assets['bundle.js'] = {
				source: () => { return bundle; },
				size: () => { return bundle.length; }
			}

			// callback
			cb();
		});

		compiler.plugin('done', () => {
			console.log('\nCompilation complete.\n');
		})
	}
}

// throw new Error('hey');
if (!args.align && !args.file) throw new Error('Alignment (--align) must be declared, if file name is custom then a file (--file) must be declared.');

// Set entry file
const entry = path.resolve(__dirname, "src", (args.align ? args.align : args.file) + ".js");

const wconfig = {
	entry: [entry],
	output: {
		path: path.resolve(__dirname, "dist"),
		filename: "bundle.js"
	},
	mode: 'development',
	module: {
		rules: [{ test: /\.js$/, exclude: /node_modules|dist/ }]
	},
	plugins: [new CMate()]
};

let compile = webpack(wconfig);

compile.watch({
	aggregateTimeout: 300
}, (err, stats) => {
	const info = stats.toJson();

	// Check for webpack errors
	if (err) {
		console.error(err.stack || err);
		if (err.details) throw new Error(err.details);
	}

	// Check for compilation errors
	if (stats.hasErrors()) console.error(info.errors[0])

	// Check for compilation warnings
	if (stats.hasWarnings()) console.warn(info.warnings[0])

	console.log(stats.toString({ chunks: false, colors: true }))

	// POST to Leverton API
	if (args.online === true) {
		let payload = {
			id: codeBlocksId,
			body: bundle,
			name: 'General'
		};

		if (sessionCookies.length === 0 && process.env.USERNAME && process.env.PASSWORD) {
			// Authentication with the service
			request.post('https://viewer.leverton.de/j_spring_security_check', { form: {j_username: process.env.USERNAME, j_password: process.env.PASSWORD}}, (error, resp, body) => {
				if (error) console.error();

				sessionCookies = resp.headers['set-cookie'];

				// Get codeblocks id
				request.get({
					url: `https://viewer.leverton.de/proxy/integrator/api/transformation/alignments/${args.align}/codeBlocks`,
					headers: {'content-type': 'application/json'}
				}, (error, resp, body) => {
					if (error) console.error(error);
					body = JSON.parse(body);

					if (body.length === 0) throw new Error('Error with getting alignment codeblock ID. Please restart compiler or check HTTP request.');

					codeBlocksId = body[0].id;
					// Update payload object
					payload.id = codeBlocksId;

					// Update codeblock
					request.put({
						headers: {'content-type': 'application/json'},
						url: `https://viewer.leverton.de/proxy/integrator/api/transformation/codeBlocks/${codeBlocksId}`,
						body: JSON.stringify(payload)
					}, (error, resp, body) => {
						if (error) console.error(error);
						if (resp.statusCode === 200) {
							console.log('Code updated successfully.');
						} else {
							console.log(resp.statusCode);
							console.log(resp.headers['x-error-message']);
						}
					});
				});
			});
		} else if (sessionCookies.length > 0 && process.env.USERNAME && process.env.PASSWORD) {
			let url = `https://viewer.leverton.de/proxy/integrator/api/transformation/codeBlocks/${codeBlocksId}`;
			let j = request.jar();
			j.setCookie(request.cookie(sessionCookies[0]), url);
			j.setCookie(request.cookie(sessionCookies[1]), url);

			// Update codeblock
			request.put({
				headers: {'content-type': 'application/json'},
				url: url,
				body: JSON.stringify(payload),
				jar: j
			}, (error, resp, body) => {
				if (error) console.error(error);
				if (resp.statusCode === 200) {
					console.log('Code updated successfully.');
				} else {
					console.log(resp.statusCode);
					console.log(resp.headers['x-error-message']);
				}
			});
		} else {
			throw new Error('Missing USERNAME and PASSWORD!');
		}
	}
});
