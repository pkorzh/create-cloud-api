const chalk = require('chalk');
const yaml = require('js-yaml');
const path = require('path');
const fs = require('fs-extra');

const paths = require('../config/paths');
const util = require('./util')

const stage = process.argv.slice(2)[0];

if (!stage) {
	process.exit(1);
}

util.apigateway.exportApi(stage).then(doc => {
	fs.writeFileSync(path.join(paths.appPath, `${util.app.name}-${util.app.region}.yml`), yaml.safeDump(doc));
	console.log(chalk.green('Successfully exported Swagger definition from AWS'));
});