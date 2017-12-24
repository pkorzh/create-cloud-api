const fs = require('fs-extra');
const path = require('path');
const yaml = require('js-yaml');

const paths = require('../../config/paths');

function getapi() {
	return yaml.safeLoad(
		fs.readFileSync(paths.appSwaggerYml).toString()
	);
}

module.exports = {
	getapi
};