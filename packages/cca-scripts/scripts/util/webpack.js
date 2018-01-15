const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const getAllLambda = require('./lambda').all;

const paths = require('../../config/paths');

function getConfig(functions) {
	return {
		entry: functions.reduce((entries, fn) => {
			entries[fn.name] = path.join(
				paths.appLambdaPath,
				fn.name,
				'index.js'
			);

			return entries;
		}, {}),
		target: 'node',
		externals: { 'aws-sdk': 'commonjs aws-sdk' },
		output: {
			path: path.join(paths.appBuildPath, 'functions'),
			library: '[name]',
			libraryTarget: 'commonjs2',
			filename: '[name]/index.js'
		},
		module: {
			rules: [
				{ 
					test: /\.js$/, 
					exclude: /node_modules/, 
					loader: 'babel-loader',
					query: {
						presets: ['env']
					}
				}
			]
		},
		plugins: [
			new UglifyJSPlugin(),
			new webpack.DefinePlugin({
				'process.env.NODE_ENV': JSON.stringify('production')
			})
		]
	}
}

function compile() {
	return new Promise((resolve, reject) => {
		webpack(getConfig(getAllLambda()), (err, status) => {
			if (err) {
				console.error(err.stack || err);

				if (err.details) {
					console.error(err.details);
				}

				reject();
			} else {
				const info = status.toJson();

				if (status.hasErrors()) {
					console.error(info.errors.join(''));
					reject();
					return
				}

				if (status.hasWarnings()) {
					console.warn(info.warnings.join(''));
				}

				resolve();
			}
		});
	});
}

module.exports = {
	getConfig,
	compile
};