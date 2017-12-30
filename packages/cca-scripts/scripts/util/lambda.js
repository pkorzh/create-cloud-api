const path = require('path');
const fs = require('fs-extra');

const paths = require('../../config/paths');

function all() {
	return fs.readdirSync(paths.appLambdaPath)
		.map(file => path.join(paths.appLambdaPath, file))
		.filter(file => fs.lstatSync(file).isDirectory())
		.map(file => {
			const pkg = require(path.join(file, 'package.json'));

			pkg.cca_scripts = pkg.cca_scripts || {};

			return {
				name: pkg.name,
				zip: `${pkg.name}-${pkg.version}.zip`,
				description: pkg.description,
				version: pkg.version,
				keywords: pkg.keywords || [],
				role: pkg.cca_scripts.iam_role_name,
				timeout: pkg.cca_scripts.timeout
			};
		});
}

module.exports = {
	all
};