const path = require('path');
const fs = require('fs-extra');

const appDirectory = fs.realpathSync(process.cwd());

const resolveApp = relativePath => path.resolve(appDirectory, relativePath);
const resolveOwn = relativePath => path.resolve(__dirname, '..', relativePath);

module.exports = {
	appPath: resolveApp('.'),

	appBuildPath: resolveApp('build'),

	appLambdaPath: resolveApp('lambda'),

	appPackageJson: resolveApp('package.json'),

	appJson: resolveApp('app.json'),

	appSwaggerYml: resolveApp('swagger.yml'),

	appTemplateJs: resolveApp('template.js'),

	ownPath: resolveOwn('.'),
};