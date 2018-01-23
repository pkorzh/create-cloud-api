const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

const getAllLambda = require('./lambda').all;

const paths = require('../../config/paths');

function getConfig(fn) {
	return {
		entry: path.join(paths.appLambdaPath, fn.name, 'index.js'),
		target: 'node',
		externals: { 'aws-sdk': 'commonjs aws-sdk' },
		output: {
			path: path.join(paths.appBuildPath, 'functions'),
			library: fn.name,
			libraryTarget: 'commonjs2',
			filename: `${fn.name}/index.js`
		},
		resolve: {
			modules: [
				path.resolve(
					path.join(paths.appLambdaPath, fn.name, 'node_modules')
				)
			]
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
		webpack(getAllLambda().map(fn => getConfig(fn)), (err, status) => {
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